import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { financeAPIManager } from '@/lib/finance-api'

export const runtime = 'nodejs'
export const maxDuration = 30

interface MarketDataRequest {
  ticker: string
  dataType: 'price' | 'company_info' | 'news'
  useCache?: boolean
}

/**
 * POST /api/finance/market-data
 * Fetches real-time market data with caching and fallback strategy
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Market data request received')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: MarketDataRequest = await request.json()
    const { ticker, dataType, useCache = true } = body

    if (!ticker || !dataType) {
      return NextResponse.json({ error: 'ticker and dataType are required' }, { status: 400 })
    }

    console.log('[v0] Fetching', dataType, 'for ticker:', ticker)

    // Check cache if enabled
    if (useCache) {
      const { data: cachedData } = await supabase
        .from('market_data_cache')
        .select('cached_data, expires_at')
        .eq('ticker', ticker)
        .eq('data_type', dataType)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (cachedData) {
        console.log('[v0] Returning cached data for', ticker)
        return NextResponse.json({
          success: true,
          data: cachedData.cached_data,
          cached: true,
          timestamp: new Date().toISOString(),
        })
      }
    }

    // Fetch fresh data
    let apiResult
    let data

    if (dataType === 'price') {
      apiResult = await financeAPIManager.getStockPrice(ticker)
      data = apiResult.data
    } else if (dataType === 'company_info') {
      apiResult = await financeAPIManager.getCompanyInfo(ticker)
      data = apiResult.data
    } else if (dataType === 'news') {
      apiResult = await financeAPIManager.getNews(ticker)
      data = apiResult.data
    }

    if (!apiResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: apiResult.error,
          apiLimitReached: apiResult.apiLimitReached,
        },
        { status: 429 }
      )
    }

    // Log API usage
    try {
      await supabase.from('api_usage_logs').insert({
        user_id: user.id,
        api_name: apiResult.provider || 'unknown',
        endpoint: dataType,
        status_code: 200,
      })
    } catch (error) {
      console.warn('[v0] Failed to log API usage:', error)
    }

    // Cache the result (24 hours expiry)
    if (data) {
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24)

      try {
        await supabase.from('market_data_cache').upsert(
          {
            ticker,
            data_type: dataType,
            cached_data: data,
            expires_at: expiresAt.toISOString(),
          },
          { onConflict: 'ticker,data_type' }
        )
      } catch (error) {
        console.warn('[v0] Failed to cache market data:', error)
      }
    }

    return NextResponse.json({
      success: true,
      data,
      provider: apiResult.provider,
      cached: false,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Market data error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Market data fetch failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/finance/market-data?ticker=AAPL&dataType=price
 * Convenience endpoint for GET requests
 */
export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')
  const dataType = request.nextUrl.searchParams.get('dataType')

  if (!ticker || !dataType) {
    return NextResponse.json({ error: 'ticker and dataType query parameters are required' }, { status: 400 })
  }

  // Convert to POST body and call POST handler
  const jsonRequest = new NextRequest(new URL(request.url), {
    method: 'POST',
    body: JSON.stringify({ ticker, dataType }),
    headers: request.headers,
  })

  return POST(jsonRequest)
}

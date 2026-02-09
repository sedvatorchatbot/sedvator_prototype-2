/**
 * Finance API Abstraction Layer
 * Manages multiple financial data providers with fallback strategy
 */

interface StockData {
  ticker: string
  price: number
  change: number
  changePercent: number
  timestamp: string
}

interface CompanyInfo {
  ticker: string
  name: string
  industry: string
  marketCap: number
  pe_ratio: number
  dividend_yield: number
}

interface NewsItem {
  headline: string
  summary: string
  source: string
  url: string
  sentiment?: string
  timestamp: string
}

interface FinanceAPIResponse {
  success: boolean
  data?: StockData | CompanyInfo | NewsItem[] | Record<string, unknown>
  error?: string
  provider?: string
  apiLimitReached?: boolean
}

class FinanceAPIManager {
  private finnhubApiKey: string
  private twelveDataApiKey: string
  private alphaVantageApiKey: string
  private requestCounts: Record<string, number> = {}
  private requestLimits: Record<string, number> = {
    finnhub: 60, // per minute
    twelve_data: 800, // per day
    alpha_vantage: 500, // per day
  }

  constructor() {
    this.finnhubApiKey = process.env.FINNHUB_API_KEY || ''
    this.twelveDataApiKey = process.env.TWELVE_DATA_API_KEY || ''
    this.alphaVantageApiKey = process.env.ALPHA_VANTAGE_API_KEY || ''

    // Initialize request counts
    this.requestCounts = {
      finnhub: 0,
      twelve_data: 0,
      alpha_vantage: 0,
    }
  }

  /**
   * Get real-time stock price with fallback strategy
   */
  async getStockPrice(ticker: string): Promise<FinanceAPIResponse> {
    console.log('[v0] Fetching stock price for:', ticker)

    try {
      // Try Finnhub first (most reliable)
      if (this.canUseAPI('finnhub')) {
        const result = await this.fetchFromFinnhub(`/quote?symbol=${ticker}`)
        if (result.success) {
          this.incrementRequestCount('finnhub')
          return result
        }
      }

      // Fallback to Twelve Data
      if (this.canUseAPI('twelve_data')) {
        const result = await this.fetchFromTwelveData(`/quote?symbol=${ticker}`)
        if (result.success) {
          this.incrementRequestCount('twelve_data')
          return result
        }
      }

      // Final fallback to Alpha Vantage
      if (this.canUseAPI('alpha_vantage')) {
        const result = await this.fetchFromAlphaVantage(`?symbol=${ticker}&function=GLOBAL_QUOTE`)
        if (result.success) {
          this.incrementRequestCount('alpha_vantage')
          return result
        }
      }

      return {
        success: false,
        error: 'All APIs exhausted',
        apiLimitReached: true,
      }
    } catch (error) {
      console.error('[v0] Stock price fetch error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Get company fundamentals
   */
  async getCompanyInfo(ticker: string): Promise<FinanceAPIResponse> {
    console.log('[v0] Fetching company info for:', ticker)

    try {
      if (this.canUseAPI('finnhub')) {
        const result = await this.fetchFromFinnhub(`/profile2?symbol=${ticker}`)
        if (result.success) {
          this.incrementRequestCount('finnhub')
          return result
        }
      }

      return {
        success: false,
        error: 'Unable to fetch company information',
      }
    } catch (error) {
      console.error('[v0] Company info fetch error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Get financial news and sentiment
   */
  async getNews(ticker: string, limit = 5): Promise<FinanceAPIResponse> {
    console.log('[v0] Fetching news for:', ticker)

    try {
      if (this.canUseAPI('finnhub')) {
        const result = await this.fetchFromFinnhub(`/company-news?symbol=${ticker}&limit=${limit}`)
        if (result.success) {
          this.incrementRequestCount('finnhub')
          return result
        }
      }

      return {
        success: false,
        error: 'Unable to fetch news',
      }
    } catch (error) {
      console.error('[v0] News fetch error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Helper: Fetch from Finnhub API
   */
  private async fetchFromFinnhub(endpoint: string): Promise<FinanceAPIResponse> {
    if (!this.finnhubApiKey) {
      return { success: false, error: 'Finnhub API key not configured' }
    }

    const url = `https://finnhub.io/api/v1${endpoint}&token=${this.finnhubApiKey}`
    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      console.error('[v0] Finnhub error:', data)
      return { success: false, error: data.error || 'Finnhub API error', provider: 'finnhub' }
    }

    return { success: true, data, provider: 'finnhub' }
  }

  /**
   * Helper: Fetch from Twelve Data API
   */
  private async fetchFromTwelveData(endpoint: string): Promise<FinanceAPIResponse> {
    if (!this.twelveDataApiKey) {
      return { success: false, error: 'Twelve Data API key not configured' }
    }

    const url = `https://api.twelvedata.com${endpoint}&apikey=${this.twelveDataApiKey}`
    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok || data.status === 'error') {
      console.error('[v0] Twelve Data error:', data)
      return { success: false, error: data.error || 'Twelve Data API error', provider: 'twelve_data' }
    }

    return { success: true, data, provider: 'twelve_data' }
  }

  /**
   * Helper: Fetch from Alpha Vantage API
   */
  private async fetchFromAlphaVantage(endpoint: string): Promise<FinanceAPIResponse> {
    if (!this.alphaVantageApiKey) {
      return { success: false, error: 'Alpha Vantage API key not configured' }
    }

    const url = `https://www.alphavantage.co/query${endpoint}&apikey=${this.alphaVantageApiKey}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.Note || data.Error) {
      console.error('[v0] Alpha Vantage error:', data)
      return { success: false, error: data.Note || data.Error, provider: 'alpha_vantage' }
    }

    return { success: true, data, provider: 'alpha_vantage' }
  }

  /**
   * Check if API can be used based on rate limits
   */
  private canUseAPI(apiName: string): boolean {
    const count = this.requestCounts[apiName] || 0
    const limit = this.requestLimits[apiName] || 0
    return count < limit
  }

  /**
   * Increment request counter
   */
  private incrementRequestCount(apiName: string): void {
    this.requestCounts[apiName] = (this.requestCounts[apiName] || 0) + 1
  }
}

// Export singleton instance
export const financeAPIManager = new FinanceAPIManager()

export type { StockData, CompanyInfo, NewsItem, FinanceAPIResponse }

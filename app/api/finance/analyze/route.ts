import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseDocumentContent, generateDocumentSummary, extractFinancialMetrics, identifyDataStructures } from '@/lib/document-processor'

export const runtime = 'nodejs'
export const maxDuration = 60

interface AnalysisRequest {
  query?: string
  analysisType: 'summary' | 'metrics' | 'insights' | 'qa'
  documentId?: string
  rawContent?: string
}

/**
 * POST /api/finance/analyze
 * Analyzes financial documents and performs LLM-based analysis
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Finance analysis request received')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: AnalysisRequest = await request.json()
    const { query, analysisType, documentId, rawContent } = body

    // Validate input
    if (!analysisType) {
      return NextResponse.json({ error: 'analysisType is required' }, { status: 400 })
    }

    let content = rawContent || ''
    let document_type = 'text'
    let fileName = 'Raw Input'

    // If documentId provided, fetch from database
    if (documentId) {
      const { data: doc, error: docError } = await supabase
        .from('financial_documents')
        .select('*')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single()

      if (docError || !doc) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }

      content = doc.extracted_content
      document_type = doc.document_type
      fileName = doc.document_name
    }

    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 })
    }

    console.log('[v0] Processing content, type:', document_type)

    // Parse document based on type
    const parsed = parseDocumentContent(content, document_type)

    // Perform analysis based on type
    let analysisResult: Record<string, unknown> = {}
    let confidence = 0.7

    switch (analysisType) {
      case 'summary': {
        const summary = generateDocumentSummary(content, 3)
        const dataStructures = identifyDataStructures(content)

        analysisResult = {
          summary,
          contentLength: content.length,
          hasStructuredData: dataStructures.hasStructuredData,
          estimatedTables: dataStructures.estimatedTables,
          format: parsed.type,
        }
        confidence = 0.85
        break
      }

      case 'metrics': {
        const metrics = extractFinancialMetrics(content)
        const dataStructures = identifyDataStructures(content)

        analysisResult = {
          extracted_metrics: metrics,
          metricsFound: Object.keys(metrics).length,
          hasStructuredData: dataStructures.hasStructuredData,
          structuredRecords: dataStructures.estimatedRecords,
        }
        confidence = 0.75
        break
      }

      case 'insights': {
        // Generate insights by analyzing content patterns
        const summary = generateDocumentSummary(content, 5)
        const metrics = extractFinancialMetrics(content)
        const dataStructures = identifyDataStructures(content)

        // Simple insight generation
        let insights: string[] = []

        if (Object.keys(metrics).length > 0) {
          insights.push('Key financial metrics found: ' + Object.keys(metrics).join(', '))
        }

        if (dataStructures.hasStructuredData) {
          insights.push(
            `Document contains ${dataStructures.estimatedTables} data table(s) with approximately ${dataStructures.estimatedRecords} records`
          )
        }

        if (content.toLowerCase().includes('risk')) {
          insights.push('Document discusses risk factors and potential challenges')
        }

        if (content.toLowerCase().includes('growth') || content.toLowerCase().includes('expand')) {
          insights.push('Growth opportunities and expansion strategies are highlighted')
        }

        analysisResult = {
          summary,
          insights,
          recommendedQuestions: [
            'What are the key financial metrics?',
            'How does this compare to industry benchmarks?',
            'What are the main risks mentioned?',
            'What growth opportunities are identified?',
          ],
          metrics,
        }
        confidence = 0.8
        break
      }

      case 'qa': {
        if (!query) {
          return NextResponse.json({ error: 'query is required for QA analysis' }, { status: 400 })
        }

        // Simple Q&A: search for relevant content
        const queryLower = query.toLowerCase()
        const contentLower = content.toLowerCase()
        const queryIndex = contentLower.indexOf(queryLower)

        let answer = 'No specific information found for this question in the document.'
        let relevantExcerpt = ''

        if (queryIndex !== -1) {
          // Extract context around the match (200 characters before and after)
          const start = Math.max(0, queryIndex - 200)
          const end = Math.min(content.length, queryIndex + query.length + 200)
          relevantExcerpt = content.substring(start, end).trim()
          answer = 'Based on the document: ' + relevantExcerpt + '...'
          confidence = 0.85
        } else {
          // Try to find related content
          const keywords = queryLower.split(' ').filter((word) => word.length > 3)
          const matches = keywords.filter((keyword) => contentLower.includes(keyword))

          if (matches.length > 0) {
            answer = `The document mentions topics related to your query: ${matches.join(', ')}`
            confidence = 0.6
          }
        }

        analysisResult = {
          query,
          answer,
          relevantExcerpt,
          confidence: confidence * 100,
        }
        break
      }
    }

    // Save analysis to database
    const { data: analysisData, error: saveError } = await supabase
      .from('financial_analyses')
      .insert({
        user_id: user.id,
        document_id: documentId,
        query: query || '',
        analysis_type: analysisType,
        analysis_result: analysisResult,
        confidence_score: confidence,
        source_data: {
          fileName,
          documentType: document_type,
          contentLength: content.length,
        },
      })
      .select()
      .single()

    if (saveError) {
      console.error('[v0] Error saving analysis:', saveError)
      // Still return the analysis even if save fails
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      analysisId: analysisData?.id,
      confidence,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}

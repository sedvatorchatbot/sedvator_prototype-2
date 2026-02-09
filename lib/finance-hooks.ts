/**
 * Finance Data Management Hooks
 * Handles fetching, caching, and managing financial analyses
 */

'use client'

import { useCallback, useState } from 'react'

interface StoredAnalysis {
  id: string
  query?: string
  analysisType: 'summary' | 'metrics' | 'insights' | 'qa'
  results: Record<string, unknown>
  confidence: number
  createdAt: string
}

interface UseFinanceDataOptions {
  userId?: string
}

/**
 * Hook for managing financial analyses
 */
export function useFinanceData(_options?: UseFinanceDataOptions) {
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Save a new analysis
   */
  const saveAnalysis = useCallback(
    async (analysisType: string, results: Record<string, unknown>, confidence: number, query?: string) => {
      setIsLoading(true)
      setError(null)

      try {
        // In production, this would save to Supabase
        // For now, we store in local state
        const newAnalysis: StoredAnalysis = {
          id: crypto.randomUUID(),
          query,
          analysisType: analysisType as 'summary' | 'metrics' | 'insights' | 'qa',
          results,
          confidence,
          createdAt: new Date().toISOString(),
        }

        setAnalyses((prev) => [newAnalysis, ...prev])
        return newAnalysis
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save analysis'
        setError(message)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  /**
   * Delete an analysis
   */
  const deleteAnalysis = useCallback((analysisId: string) => {
    setAnalyses((prev) => prev.filter((a) => a.id !== analysisId))
  }, [])

  /**
   * Get analysis by ID
   */
  const getAnalysis = useCallback(
    (analysisId: string) => {
      return analyses.find((a) => a.id === analysisId)
    },
    [analyses]
  )

  /**
   * Get analyses by type
   */
  const getAnalysesByType = useCallback(
    (type: 'summary' | 'metrics' | 'insights' | 'qa') => {
      return analyses.filter((a) => a.type === type)
    },
    [analyses]
  )

  /**
   * Clear all analyses
   */
  const clearAnalyses = useCallback(() => {
    setAnalyses([])
  }, [])

  return {
    analyses,
    isLoading,
    error,
    saveAnalysis,
    deleteAnalysis,
    getAnalysis,
    getAnalysesByType,
    clearAnalyses,
  }
}

/**
 * Utility: Format confidence as percentage
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}

/**
 * Utility: Determine confidence level badge
 */
export function getConfidenceBadge(confidence: number): {
  label: string
  color: string
} {
  if (confidence >= 0.85) {
    return { label: 'High', color: 'text-green-600' }
  }
  if (confidence >= 0.7) {
    return { label: 'Medium', color: 'text-cyan-600' }
  }
  if (confidence >= 0.5) {
    return { label: 'Low', color: 'text-yellow-600' }
  }
  return { label: 'Very Low', color: 'text-red-600' }
}

/**
 * Utility: Extract summary from analysis
 */
export function extractSummary(analysis: StoredAnalysis): string | null {
  const { results } = analysis

  switch (analysis.analysisType) {
    case 'summary':
      return (results.summary as string) || null
    case 'metrics':
      return `Extracted ${Object.keys(results.extracted_metrics || {}).length} metrics`
    case 'insights':
      return (results.insights as string[])?.[0] || null
    case 'qa':
      return (results.answer as string) || null
    default:
      return null
  }
}

/**
 * Utility: Get icon for analysis type
 */
export function getAnalysisIcon(type: 'summary' | 'metrics' | 'insights' | 'qa') {
  switch (type) {
    case 'summary':
      return '📄'
    case 'metrics':
      return '📊'
    case 'insights':
      return '💡'
    case 'qa':
      return '❓'
    default:
      return '📋'
  }
}

/**
 * Utility: Get analysis type label
 */
export function getAnalysisLabel(type: 'summary' | 'metrics' | 'insights' | 'qa'): string {
  const labels: Record<string, string> = {
    summary: 'Document Summary',
    metrics: 'Financial Metrics',
    insights: 'Key Insights',
    qa: 'Q&A Response',
  }
  return labels[type] || type
}

'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { TrendingUp, Zap, BarChart3, MessageSquare } from 'lucide-react'

interface AnalysisResult {
  summary?: string
  insights?: string[]
  extracted_metrics?: Record<string, unknown>
  metricsFound?: number
  query?: string
  answer?: string
  recommendedQuestions?: string[]
  confidence?: number
}

interface AnalysisResultsProps {
  results: AnalysisResult
  analysisType: 'summary' | 'metrics' | 'insights' | 'qa'
  confidence?: number
}

export function AnalysisResults({ results, analysisType, confidence = 0.75 }: AnalysisResultsProps) {
  return (
    <div className="space-y-4">
      {/* Confidence Score */}
      <div className="flex items-center justify-between px-4 py-2 bg-background border border-border rounded-lg">
        <span className="text-sm font-medium text-foreground">Analysis Confidence</span>
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
              style={{ width: `${Math.min(confidence * 100, 100)}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-cyan-600">{Math.round(confidence * 100)}%</span>
        </div>
      </div>

      {analysisType === 'summary' && results.summary && (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Document Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{results.summary}</p>
            </div>
          </div>
        </Card>
      )}

      {analysisType === 'metrics' && results.extracted_metrics && (
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-3">Extracted Financial Metrics</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(results.extracted_metrics).map(([key, value]) => (
                  <div key={key} className="p-2 bg-background border border-border rounded">
                    <p className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
                    <p className="text-sm font-semibold text-foreground">{String(value)}</p>
                  </div>
                ))}
              </div>
              {Object.keys(results.extracted_metrics).length === 0 && (
                <p className="text-sm text-muted-foreground">No specific financial metrics found</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {analysisType === 'insights' && results.insights && (
        <>
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-3">Key Insights</h3>
                <ul className="space-y-2">
                  {results.insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-500 font-bold mt-0.5">•</span>
                      <span className="text-sm text-muted-foreground">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {results.recommendedQuestions && results.recommendedQuestions.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Ask about this data:
              </h3>
              <div className="space-y-2">
                {results.recommendedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    className="w-full text-left p-2 rounded-lg border border-border hover:border-cyan-500 hover:bg-cyan-500/5 transition-colors text-sm text-muted-foreground hover:text-foreground"
                  >
                    "{question}"
                  </button>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {analysisType === 'qa' && results.answer && (
        <Card className="p-4">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">YOUR QUESTION</p>
              <p className="text-sm font-medium text-foreground italic">"{results.query}"</p>
            </div>

            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1">ANSWER</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{results.answer}</p>
            </div>

            {results.relevantExcerpt && (
              <div className="border-t border-border pt-3">
                <p className="text-xs font-semibold text-muted-foreground mb-1">RELEVANT EXCERPT</p>
                <p className="text-xs text-muted-foreground bg-background p-2 rounded border border-border italic">
                  "{results.relevantExcerpt}"
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

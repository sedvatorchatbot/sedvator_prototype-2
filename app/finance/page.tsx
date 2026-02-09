'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { DataUpload } from '@/components/data-upload'
import { AnalysisResults } from '@/components/analysis-results'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TrendingUp, BarChart3, MessageSquare, Zap, ArrowLeft, Home } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

interface Analysis {
  type: 'summary' | 'metrics' | 'insights' | 'qa'
  results: Record<string, unknown>
  confidence: number
  timestamp: string
}

export default function FinanceAnalysisPage() {
  const [content, setContent] = useState('')
  const [fileType, setFileType] = useState('text')
  const [fileName, setFileName] = useState('')
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [qaQuery, setQaQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'summary' | 'metrics' | 'insights' | 'qa'>('summary')

  const handleUpload = (uploadedContent: string, type: string, name: string) => {
    console.log('[v0] Document uploaded:', name)
    setContent(uploadedContent)
    setFileType(type)
    setFileName(name)
    setAnalyses([]) // Clear previous analyses
    performAnalysis('summary', uploadedContent, type)
  }

  const performAnalysis = async (
    analysisType: 'summary' | 'metrics' | 'insights' | 'qa',
    contentToAnalyze?: string,
    typeToAnalyze?: string,
    query?: string
  ) => {
    const bodyContent = contentToAnalyze || content
    const bodyType = typeToAnalyze || fileType

    if (!bodyContent) {
      alert('Please upload or paste data first')
      return
    }

    setIsLoading(true)

    try {
      console.log('[v0] Starting analysis:', analysisType)

      const response = await fetch('/api/finance/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisType,
          rawContent: bodyContent,
          query,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('[v0] Analysis error:', data)
        alert('Analysis failed: ' + (data.error || 'Unknown error'))
        return
      }

      console.log('[v0] Analysis completed:', analysisType)

      const newAnalysis: Analysis = {
        type: analysisType,
        results: data.analysis,
        confidence: data.confidence,
        timestamp: data.timestamp,
      }

      setAnalyses((prev) => {
        const filtered = prev.filter((a) => a.type !== analysisType)
        return [...filtered, newAnalysis]
      })

      setActiveTab(analysisType)
    } catch (error) {
      console.error('[v0] Analysis request error:', error)
      alert('Error during analysis. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQA = () => {
    if (!qaQuery.trim()) {
      alert('Please enter a question')
      return
    }
    performAnalysis('qa', content, fileType, qaQuery)
  }

  const currentAnalysis = analyses.find((a) => a.type === activeTab)

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground">|</span>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-border bg-gradient-to-r from-background to-cyan-500/5">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Data & Finance Analysis</h1>
              <p className="text-sm text-muted-foreground mt-1">Upload financial documents, datasets, or market data for AI-powered analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Upload & Controls */}
          <div className="space-y-4">
            <Card className="p-4">
              <h2 className="font-semibold text-foreground mb-4">1. Upload Data</h2>
              <DataUpload onUpload={handleUpload} isLoading={isLoading} />
            </Card>

            {content && (
              <Card className="p-4 bg-cyan-500/5 border-cyan-500/20">
                <h3 className="text-sm font-semibold text-foreground mb-2">Document Info</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">File:</span> {fileName}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Type:</span> {fileType.toUpperCase()}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Size:</span> {(content.length / 1024).toFixed(1)} KB
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Analysis */}
          <div className="lg:col-span-2 space-y-4">
            {!content ? (
              <Card className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold text-foreground mb-2">No Data Uploaded Yet</h3>
                <p className="text-sm text-muted-foreground">Upload or paste financial data to get started with analysis</p>
              </Card>
            ) : (
              <>
                {/* Analysis Types */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => performAnalysis('summary')}
                    disabled={isLoading}
                    className={`p-3 rounded-lg border transition-all ${
                      activeTab === 'summary'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600'
                        : 'border-border text-muted-foreground hover:border-cyan-500'
                    } disabled:opacity-50`}
                  >
                    <Zap className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs font-medium">Summary</span>
                  </button>

                  <button
                    onClick={() => performAnalysis('metrics')}
                    disabled={isLoading}
                    className={`p-3 rounded-lg border transition-all ${
                      activeTab === 'metrics'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600'
                        : 'border-border text-muted-foreground hover:border-cyan-500'
                    } disabled:opacity-50`}
                  >
                    <BarChart3 className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs font-medium">Metrics</span>
                  </button>

                  <button
                    onClick={() => performAnalysis('insights')}
                    disabled={isLoading}
                    className={`p-3 rounded-lg border transition-all ${
                      activeTab === 'insights'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600'
                        : 'border-border text-muted-foreground hover:border-cyan-500'
                    } disabled:opacity-50`}
                  >
                    <TrendingUp className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs font-medium">Insights</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('qa')}
                    disabled={isLoading}
                    className={`p-3 rounded-lg border transition-all ${
                      activeTab === 'qa'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600'
                        : 'border-border text-muted-foreground hover:border-cyan-500'
                    } disabled:opacity-50`}
                  >
                    <MessageSquare className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs font-medium">Ask</span>
                  </button>
                </div>

                {/* Q&A Input */}
                {activeTab === 'qa' && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask a question about your data..."
                      value={qaQuery}
                      onChange={(e) => setQaQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleQA()}
                      disabled={isLoading}
                    />
                    <Button onClick={handleQA} disabled={isLoading} className="bg-cyan-500 hover:bg-cyan-600 text-white">
                      {isLoading ? 'Analyzing...' : 'Ask'}
                    </Button>
                  </div>
                )}

                {/* Results */}
                {currentAnalysis && !isLoading ? (
                  <AnalysisResults
                    results={currentAnalysis.results as Record<string, unknown>}
                    analysisType={currentAnalysis.type}
                    confidence={currentAnalysis.confidence}
                  />
                ) : isLoading ? (
                  <Card className="p-8 text-center">
                    <div className="inline-block">
                      <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-3" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Analyzing your data...</p>
                  </Card>
                ) : (
                  <Card className="p-8 text-center text-muted-foreground">
                    <p className="text-sm">Click an analysis type to start</p>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Zap, title: 'Auto Summary', desc: 'Get concise document summaries instantly' },
            { icon: BarChart3, title: 'Extract Metrics', desc: 'Pull key financial metrics automatically' },
            { icon: TrendingUp, title: 'Key Insights', desc: 'Discover trends and opportunities' },
            { icon: MessageSquare, title: 'Ask Questions', desc: 'Natural language Q&A on your data' },
          ].map((feature, idx) => (
            <Card key={idx} className="p-4 text-center">
              <feature.icon className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
              <h3 className="font-semibold text-foreground text-sm">{feature.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

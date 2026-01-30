'use client'

import { useState } from 'react'
import { MockTestSelector } from '@/components/mock-test-selector'
import { MockTestInterface } from '@/components/mock-test-interface'
import { MockTestAnalysis } from '@/components/mock-test-analysis'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface MockTest {
  id: string
  test_name: string
  total_questions: number
  total_marks: number
  time_limit_minutes: number
  marking_scheme: Record<string, number>
  questions: any[]
  sections?: Array<{
    subject: string
    mcqCount?: number
    integerCount?: number
  }>
  exam_type?: string
}

export function MockTestHub() {
  const [stage, setStage] = useState<'selector' | 'test' | 'results'>('selector')
  const [isGenerating, setIsGenerating] = useState(false)
  const [mockTest, setMockTest] = useState<MockTest | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<any | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleTestSelect = async (examType: string, jeeAdvancedTime?: number) => {
    setIsGenerating(true)
    setErrorMessage(null)
    try {
      console.log('[v0] Generating mock test for exam:', examType, 'JEE Time:', jeeAdvancedTime)

      // Generate test
      const generateResponse = await fetch('/api/mock-test/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType,
          jeeAdvancedTime,
        }),
      })

      if (!generateResponse.ok) {
        const error = await generateResponse.json()
        throw new Error(error.error || 'Failed to generate test')
      }

      const { mockTest: generatedTest } = await generateResponse.json()
      console.log('[v0] Mock test generated:', generatedTest.id)

      // Start attempt
      const attemptResponse = await fetch('/api/mock-test/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mockTestId: generatedTest.id,
          action: 'start',
        }),
      })

      if (!attemptResponse.ok) {
        throw new Error('Failed to start test attempt')
      }

      const { attemptId: newAttemptId } = await attemptResponse.json()
      console.log('[v0] Attempt started:', newAttemptId)

      setMockTest(generatedTest)
      setAttemptId(newAttemptId)
      setStage('test')
    } catch (error) {
      console.error('[v0] Error generating test:', error)
      const errorMsg = error instanceof Error ? error.message : 'Failed to generate test'
      setErrorMessage(errorMsg)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTestSubmit = async (responses: any[]) => {
    try {
      console.log('[v0] Submitting test...')

      const submitResponse = await fetch('/api/mock-test/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          action: 'submit',
          responses,
        }),
      })

      if (!submitResponse.ok) {
        throw new Error('Failed to submit test')
      }

      const { result } = await submitResponse.json()
      console.log('[v0] Test submitted successfully')

      setTestResult(result)
      setStage('results')
    } catch (error) {
      console.error('[v0] Error submitting test:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit test')
    }
  }

  const handleRetakeTest = () => {
    setStage('selector')
    setMockTest(null)
    setAttemptId(null)
    setTestResult(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link href="/games">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold text-foreground">Mock Tests</h1>
            <p className="text-xs text-muted-foreground">CBSE & JEE Practice Tests</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        {errorMessage && (
          <Card className="p-4 border-amber-500/30 bg-amber-500/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-400">Notice</p>
                <p className="text-sm text-amber-300 mt-1">{errorMessage}</p>
                <p className="text-xs text-amber-300 mt-2">
                  ✓ Mock tests are now powered by pre-generated question banks (no API rate limits!)
                </p>
              </div>
            </div>
          </Card>
        )}

        {stage === 'selector' && (
          <MockTestSelector onTestSelect={handleTestSelect} isLoading={isGenerating} />
        )}

        {stage === 'test' && mockTest && attemptId && (
          <div className="space-y-4">
            {isGenerating && (
              <Card className="p-6 text-center border-border">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-400 mb-3" />
                <p className="text-muted-foreground">Generating mock test with AI...</p>
              </Card>
            )}
            {!isGenerating && (
              <MockTestInterface mockTest={mockTest} onSubmit={handleTestSubmit} />
            )}
          </div>
        )}

        {stage === 'results' && testResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRetakeTest}
                variant="outline"
                className="border-border bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tests
              </Button>
            </div>
            <MockTestAnalysis result={testResult} onRetry={handleRetakeTest} />
          </div>
        )}
      </div>
    </div>
  )
}

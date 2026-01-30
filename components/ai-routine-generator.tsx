'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles, ArrowLeft } from 'lucide-react'

interface AIRoutineGeneratorProps {
  onGenerate: (routine: any) => Promise<void>
  onCancel: () => void
}

export function AIRoutineGenerator({
  onGenerate,
  onCancel,
}: AIRoutineGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [routineName, setRoutineName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleGenerateRoutine = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || !routineName.trim()) {
      setError('Please fill in all fields')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      console.log('[v0] Generating routine with prompt:', prompt)

      const response = await fetch('/api/routine/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          routineName,
        }),
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        let errorMsg = 'Failed to generate routine'
        
        if (contentType?.includes('application/json')) {
          const data = await response.json()
          errorMsg = data.error || errorMsg
        } else {
          errorMsg = `Server error (${response.status}). Please check your input and try again.`
        }
        
        throw new Error(errorMsg)
      }

      const result = await response.json()
      console.log('[v0] Generated routine:', result)

      await onGenerate(result)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate routine'
      console.error('[v0] Error:', errorMsg)
      setError(errorMsg)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="p-6 border-border">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h2 className="text-2xl font-semibold">AI Routine Generator</h2>
          <p className="text-sm text-muted-foreground">
            Describe your study goal and we'll create an optimal routine
          </p>
        </div>
      </div>

      <form onSubmit={handleGenerateRoutine} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Routine Name
          </label>
          <Input
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            placeholder="e.g., Exam Preparation, Daily Learning..."
            className="bg-secondary border-border"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Describe your study goal
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Tell us about your study goals, available time, subjects, and any preferences. For example: 'I want to prepare for my physics exam in 2 weeks. I can study 6-8 hours daily. Need to cover mechanics, thermodynamics, and waves. I learn better in morning sessions with 15-min breaks.'"
            className="bg-secondary border-border min-h-32"
          />
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-border text-muted-foreground bg-transparent"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isGenerating || !prompt.trim() || !routineName.trim()}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Your Routine...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Routine
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}

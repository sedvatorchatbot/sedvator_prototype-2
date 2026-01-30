'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles } from 'lucide-react'

interface SimpleRoutineGeneratorProps {
  onGenerate: (routine: any) => Promise<void>
  onCancel: () => void
}

export function SimpleRoutineGenerator({
  onGenerate,
  onCancel,
}: SimpleRoutineGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) {
      setError('Please describe your study goal')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      console.log('[v0] Generating routine from prompt:', prompt)

      const response = await fetch('/api/routine/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate routine')
      }

      const result = await response.json()
      console.log('[v0] Routine generated successfully')
      await onGenerate(result)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate routine'
      console.error('[v0] Generation error:', errorMsg)
      setError(errorMsg)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="p-6 border-border space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg flex-shrink-0">
          <Sparkles className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Generate Study Routine</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Describe your study goal and AI will create an optimal schedule with automatic breaks
          </p>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: I need to prepare for my physics exam in 2 weeks. I have 6-8 hours available daily. I need to cover mechanics, thermodynamics, and waves..."
          className="bg-secondary border-border min-h-24 resize-none"
          disabled={isGenerating}
        />

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isGenerating}
            className="border-border text-muted-foreground bg-transparent"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white flex-1 gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Your Routine...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Routine
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          AI will automatically create a complete study schedule with 5-15 minute breaks between sessions,
          optimal timing based on cognitive science, and reminders for each session.
        </p>
      </form>
    </Card>
  )
}

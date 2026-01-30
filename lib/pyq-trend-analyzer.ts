// PYQ Trend Analyzer & AI-Powered Distribution Adjuster
// Analyzes historical PYQ data to calculate chapter-wise percentages
// Uses Groq AI to intelligently adjust distributions based on trends

import type { PYQQuestion } from './pyq-database'

interface ChapterStats {
  chapterName: string
  subject: string
  totalQuestions: number
  percentage: number
  years: number[]
  avgYearDifference: number
}

interface DistributionAnalysis {
  examType: string
  analyzedQuestions: number
  chapterStats: ChapterStats[]
  timestampAnalyzed: Date
}

interface AIAdjustedDistribution {
  originalDistribution: Record<string, number>
  adjustedDistribution: Record<string, number>
  adjustmentReason: string
  confidenceScore: number
}

/**
 * Analyze PYQ data to calculate chapter-wise question distribution
 */
export function analyzePYQTrends(questions: PYQQuestion[]): ChapterStats[] {
  const chapterMap = new Map<string, PYQQuestion[]>()

  // Group questions by chapter
  questions.forEach((q) => {
    const key = `${q.subject}__${q.chapter}`
    if (!chapterMap.has(key)) {
      chapterMap.set(key, [])
    }
    chapterMap.get(key)!.push(q)
  })

  // Calculate statistics for each chapter
  const stats: ChapterStats[] = Array.from(chapterMap.entries()).map(([key, qList]) => {
    const [subject, chapter] = key.split('__')
    const years = [...new Set(qList.map((q) => q.year))].sort()
    const latestYear = years[years.length - 1]
    const avgYearDiff = years.length > 1 ? (latestYear - years[0]) / (years.length - 1) : 0

    return {
      chapterName: chapter,
      subject,
      totalQuestions: qList.length,
      percentage: 0, // Will calculate below
      years,
      avgYearDifference: avgYearDiff,
    }
  })

  // Calculate percentages
  const totalQs = stats.reduce((sum, s) => sum + s.totalQuestions, 0)
  stats.forEach((s) => {
    s.percentage = (s.totalQuestions / totalQs) * 100
  })

  return stats.sort((a, b) => b.percentage - a.percentage)
}

/**
 * Calculate chapter-wise distribution percentages
 */
export function calculateDistribution(questions: PYQQuestion[]): Record<string, number> {
  const distribution: Record<string, number> = {}
  const chapterMap = new Map<string, number>()

  questions.forEach((q) => {
    const chapterKey = q.chapter
    chapterMap.set(chapterKey, (chapterMap.get(chapterKey) || 0) + 1)
  })

  const total = questions.length
  Array.from(chapterMap.entries()).forEach(([chapter, count]) => {
    distribution[chapter] = Math.round((count / total) * 100)
  })

  return distribution
}

/**
 * AI-powered distribution adjustment using Groq
 * Analyzes trends and adjusts chapter percentages intelligently
 */
export async function adjustDistributionWithAI(
  originalDistribution: Record<string, number>,
  questions: PYQQuestion[],
  examType: string
): Promise<AIAdjustedDistribution> {
  try {
    const stats = analyzePYQTrends(questions)

    // Build analysis context
    const analysisContext = `
Exam Type: ${examType}
Total PYQ Questions Analyzed: ${questions.length}

Current Chapter Distribution (based on historical PYQs):
${stats.map((s) => `- ${s.chapterName} (${s.subject}): ${s.percentage.toFixed(1)}% (${s.totalQuestions} questions, appeared in years: ${s.years.join(', ')})`).join('\n')}

Task: Analyze the PYQ trends and suggest adjusted chapter distribution percentages for upcoming mock tests.
Consider:
1. High-frequency chapters (more than 20% of PYQs) are likely core concepts
2. Trending chapters (appeared in recent years) should get slight boost
3. Chapters that appear consistently across years are reliable
4. Outlier chapters with very low frequency might need slight reduction

Provide JSON response with:
{
  "adjustedDistribution": { "chapterName": percentage, ... },
  "reasoning": "explanation of adjustments",
  "confidence": 0-100
}
    `

    // Call Groq AI for intelligent adjustment
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'user',
            content: analysisContext,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      console.error('[v0] Groq API error:', response.statusText)
      // Fallback: Return original distribution
      return {
        originalDistribution,
        adjustedDistribution: originalDistribution,
        adjustmentReason: 'Using original distribution (AI adjustment unavailable)',
        confidenceScore: 0,
      }
    }

    const data = await response.json()
    const aiText = data.choices[0]?.message?.content || ''

    // Parse JSON from AI response
    const jsonMatch = aiText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        originalDistribution,
        adjustedDistribution: originalDistribution,
        adjustmentReason: 'Could not parse AI response',
        confidenceScore: 0,
      }
    }

    const aiResponse = JSON.parse(jsonMatch[0])

    // Normalize percentages to 100
    const adjustedDist = aiResponse.adjustedDistribution || originalDistribution
    const total = Object.values(adjustedDist).reduce((sum: number, val: number) => sum + val, 0)
    const normalizedDist: Record<string, number> = {}
    Object.entries(adjustedDist).forEach(([chapter, percentage]) => {
      normalizedDist[chapter] = Math.round(((percentage as number) / total) * 100)
    })

    return {
      originalDistribution,
      adjustedDistribution: normalizedDist,
      adjustmentReason: aiResponse.reasoning || 'AI-powered trend analysis',
      confidenceScore: aiResponse.confidence || 75,
    }
  } catch (error) {
    console.error('[v0] Error in AI adjustment:', error)
    return {
      originalDistribution,
      adjustedDistribution: originalDistribution,
      adjustmentReason: 'Error during AI processing, using original',
      confidenceScore: 0,
    }
  }
}

/**
 * Get distribution for test generation
 * Combines trend analysis and AI adjustment
 */
export async function getOptimizedDistribution(
  questions: PYQQuestion[],
  examType: string
): Promise<Record<string, number>> {
  const originalDist = calculateDistribution(questions)

  // Only use AI if Groq API is available
  if (process.env.GROQ_API_KEY) {
    const aiAdjusted = await adjustDistributionWithAI(originalDist, questions, examType)
    console.log('[v0] Distribution adjusted with AI:', aiAdjusted.adjustmentReason)
    return aiAdjusted.adjustedDistribution
  }

  return originalDist
}

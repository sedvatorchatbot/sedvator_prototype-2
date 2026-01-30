// PYQ Trend Analyzer & Distribution Optimizer
// Analyzes historical PYQ data to calculate intelligent chapter-wise percentages
// Uses deterministic algorithms (no external API dependency)

import type { PYQQuestion } from './pyq-database'

interface ChapterStats {
  chapterName: string
  subject: string
  totalQuestions: number
  percentage: number
  years: number[]
  recencyScore: number
  consistencyScore: number
  optimizedPercentage: number
}

interface DistributionAnalysis {
  examType: string
  analyzedQuestions: number
  chapterStats: ChapterStats[]
  timestampAnalyzed: Date
}

/**
 * Calculate recency score based on which years questions appeared
 * Recent years get higher scores
 */
function calculateRecencyScore(years: number[]): number {
  if (years.length === 0) return 0
  const currentYear = new Date().getFullYear()
  const latestYear = Math.max(...years)
  const yearsSinceLatest = currentYear - latestYear
  // Score: 100 for this year, decreases by 20 per year
  return Math.max(0, 100 - yearsSinceLatest * 20)
}

/**
 * Calculate consistency score based on how often chapter appears across years
 */
function calculateConsistencyScore(years: number[]): number {
  if (years.length === 0) return 0
  const uniqueYears = new Set(years).size
  // Higher score if appears in more different years
  // Max 5 years, so max score is 100 when appears in all 5
  return Math.min(100, (uniqueYears / 5) * 100)
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
    
    return {
      chapterName: chapter,
      subject,
      totalQuestions: qList.length,
      percentage: 0, // Will calculate below
      years,
      recencyScore: calculateRecencyScore(years),
      consistencyScore: calculateConsistencyScore(years),
      optimizedPercentage: 0, // Will calculate below
    }
  })

  // Calculate base percentages
  const totalQs = stats.reduce((sum, s) => sum + s.totalQuestions, 0)
  stats.forEach((s) => {
    s.percentage = (s.totalQuestions / totalQs) * 100
  })

  // Calculate optimized percentages with AI-like adjustments
  // Factor in: frequency (60%), recency (25%), consistency (15%)
  stats.forEach((s) => {
    const baseScore = s.percentage
    const recencyBoost = (s.recencyScore / 100) * 15 // +15% max for recent chapters
    const consistencyBoost = (s.consistencyScore / 100) * 10 // +10% max for consistent
    s.optimizedPercentage = baseScore + recencyBoost + consistencyBoost
  })

  // Re-normalize optimized percentages to 100
  const totalOptimized = stats.reduce((sum, s) => sum + s.optimizedPercentage, 0)
  stats.forEach((s) => {
    s.optimizedPercentage = (s.optimizedPercentage / totalOptimized) * 100
  })

  return stats.sort((a, b) => b.optimizedPercentage - a.optimizedPercentage)
}

/**
 * Calculate chapter-wise distribution percentages with optimization
 */
export function calculateDistribution(questions: PYQQuestion[]): Record<string, number> {
  const stats = analyzePYQTrends(questions)
  const distribution: Record<string, number> = {}

  stats.forEach((stat) => {
    distribution[stat.chapterName] = Math.round(stat.optimizedPercentage)
  })

  return distribution
}

/**
 * Get optimized distribution - uses deterministic trend analysis
 * No external API calls, so no deprecation issues
 */
export async function getOptimizedDistribution(
  questions: PYQQuestion[],
  examType: string
): Promise<Record<string, number>> {
  try {
    console.log('[v0] Analyzing PYQ trends for', examType)
    const stats = analyzePYQTrends(questions)
    
    // Log analysis for transparency
    console.log(
      '[v0] Optimized chapter distribution:',
      stats.slice(0, 5).map((s) => `${s.chapterName}: ${s.optimizedPercentage.toFixed(1)}%`).join(', ')
    )

    const distribution: Record<string, number> = {}
    stats.forEach((stat) => {
      distribution[stat.chapterName] = Math.round(stat.optimizedPercentage)
    })

    // Ensure total is 100
    let total = Object.values(distribution).reduce((sum, val) => sum + val, 0)
    if (total !== 100) {
      const diff = 100 - total
      const firstChapter = Object.keys(distribution)[0]
      if (firstChapter) {
        distribution[firstChapter] += diff
      }
    }

    return distribution
  } catch (error) {
    console.error('[v0] Error calculating distribution:', error)
    // Fallback: equal distribution
    const chapters = [...new Set(questions.map((q) => q.chapter))]
    const fallback: Record<string, number> = {}
    const percent = Math.floor(100 / chapters.length)
    chapters.forEach((ch) => {
      fallback[ch] = percent
    })
    return fallback
  }
}

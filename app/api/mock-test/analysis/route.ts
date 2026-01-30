// GET /api/mock-test/analysis?examType=cbse_10
// Returns PYQ trend analysis and AI-adjusted distribution for exam type

import {
  cbseClass9PYQs,
  cbseClass10PYQs,
  cbseClass11PYQs,
  cbseClass12PYQs,
  jeeMainsPYQs,
  jeeAdvancedPYQs,
} from '@/lib/pyq-database'
import { analyzePYQTrends, calculateDistribution, adjustDistributionWithAI } from '@/lib/pyq-trend-analyzer'

function getPYQsForExam(examType: string) {
  switch (examType) {
    case 'cbse_9':
      return cbseClass9PYQs
    case 'cbse_10':
      return cbseClass10PYQs
    case 'cbse_11':
      return cbseClass11PYQs
    case 'cbse_12':
      return cbseClass12PYQs
    case 'jee_mains':
      return jeeMainsPYQs
    case 'jee_advanced':
      return jeeAdvancedPYQs
    default:
      return cbseClass10PYQs
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const examType = searchParams.get('examType') || 'cbse_10'

    console.log('[v0] Fetching trend analysis for:', examType)

    const pyqs = getPYQsForExam(examType)

    // Get trend analysis
    const trendStats = analyzePYQTrends(pyqs)

    // Get original distribution
    const originalDistribution = calculateDistribution(pyqs)

    // Get AI-adjusted distribution
    const aiAdjustment = await adjustDistributionWithAI(
      originalDistribution,
      pyqs,
      examType
    )

    // Format chapter statistics
    const formattedStats = trendStats.map((stat) => ({
      chapter: stat.chapterName,
      subject: stat.subject,
      questionsCount: stat.totalQuestions,
      originalPercentage: parseFloat(stat.percentage.toFixed(1)),
      adjustedPercentage: parseFloat((aiAdjustment.adjustedDistribution[stat.chapterName] || 0).toFixed(1)),
      yearsAppeared: stat.years,
      trend: stat.years.length > 1 ? 'consistent' : 'occasional',
    }))

    return Response.json({
      success: true,
      examType,
      totalQuestionsAnalyzed: pyqs.length,
      trendAnalysis: {
        chapters: formattedStats,
        originalDistribution,
        adjustedDistribution: aiAdjustment.adjustedDistribution,
        adjustmentReason: aiAdjustment.adjustmentReason,
        confidenceScore: aiAdjustment.confidenceScore,
      },
    })
  } catch (error) {
    console.error('[v0] Error analyzing trends:', error)
    const message = error instanceof Error ? error.message : 'Failed to analyze trends'
    return Response.json({ error: message }, { status: 500 })
  }
}

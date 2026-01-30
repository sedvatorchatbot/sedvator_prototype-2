import { createClient } from '@/lib/supabase/server'
import {
  selectQuestionsWithDistribution,
  cbseClass9PYQs,
  cbseClass10PYQs,
  cbseClass11PYQs,
  cbseClass12PYQs,
  jeeMainsPYQs,
  jeeAdvancedPYQs,
  examDistributions,
  type PYQQuestion,
} from '@/lib/pyq-database'
import { getOptimizedDistribution, analyzePYQTrends } from '@/lib/pyq-trend-analyzer'

const allQuestions = [
  ...cbseClass9PYQs,
  ...cbseClass10PYQs,
  ...cbseClass11PYQs,
  ...cbseClass12PYQs,
  ...jeeMainsPYQs,
  ...jeeAdvancedPYQs,
]

const distribution = examDistributions

function getAllQuestionsForExam(examType: string): PYQQuestion[] {
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

function getTestConfig(examType: string, jeeAdvancedTime?: number) {
  const configs: Record<string, any> = {
    cbse_9: {
      name: 'CBSE Class 9 Mock Test',
      totalQuestions: 38,
      totalMarks: 38,
      timeLimitMinutes: 180,
      markingScheme: { correct: 1, incorrect: 0 },
    },
    cbse_10: {
      name: 'CBSE Class 10 Mock Test',
      totalQuestions: 40,
      totalMarks: 40,
      timeLimitMinutes: 180,
      markingScheme: { correct: 1, incorrect: 0 },
    },
    cbse_11: {
      name: 'CBSE Class 11 Mock Test',
      totalQuestions: 35,
      totalMarks: 35,
      timeLimitMinutes: 180,
      markingScheme: { correct: 1, incorrect: 0 },
    },
    cbse_12: {
      name: 'CBSE Class 12 Mock Test',
      totalQuestions: 40,
      totalMarks: 40,
      timeLimitMinutes: 180,
      markingScheme: { correct: 1, incorrect: 0 },
    },
    jee_mains: {
      name: 'JEE Mains Full Test (All Subjects)',
      totalQuestions: 75,
      totalMarks: 300,
      timeLimitMinutes: 180,
      markingScheme: { correct: 4, incorrect: -2 },
      sections: [
        { subject: 'Physics', mcqCount: 20, integerCount: 5 },
        { subject: 'Chemistry', mcqCount: 20, integerCount: 5 },
        { subject: 'Mathematics', mcqCount: 20, integerCount: 5 },
      ],
    },
    jee_advanced: {
      name: 'JEE Advanced Full Test (All Subjects)',
      totalQuestions: 75,
      totalMarks: 300,
      timeLimitMinutes: jeeAdvancedTime ? jeeAdvancedTime * 60 : 180,
      markingScheme: { correct: 4, incorrect: -2 },
      sections: [
        { subject: 'Physics', mcqCount: 20, integerCount: 5 },
        { subject: 'Chemistry', mcqCount: 20, integerCount: 5 },
        { subject: 'Mathematics', mcqCount: 20, integerCount: 5 },
      ],
    },
  }

  return configs[examType] || configs.cbse_10
}

function getPYQsForExam(examType: string): PYQQuestion[] {
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

export async function POST(request: Request) {
  try {
    const { examType, jeeAdvancedTime } = await request.json()

    console.log('[v0] Generating mock test for:', examType)
    console.log('[v0] Analyzing PYQ trends...')

    const config = getTestConfig(examType, jeeAdvancedTime)
    const pyqs = getPYQsForExam(examType)

    // Analyze PYQ trends
    const trendAnalysis = analyzePYQTrends(pyqs)
    console.log('[v0] Trend Analysis:', trendAnalysis.map((t) => `${t.chapterName}: ${t.percentage.toFixed(1)}%`).join(', '))

    // Get AI-optimized distribution
    const optimizedDistribution = await getOptimizedDistribution(pyqs, examType)
    console.log('[v0] AI-Optimized Distribution:', optimizedDistribution)

    // Select questions with optimized distribution
    const selectedQuestions = selectQuestionsWithDistribution(
      pyqs,
      config.totalQuestions,
      examType,
      optimizedDistribution
    )

    console.log('[v0] Selected', selectedQuestions.length, 'questions with AI-optimized distribution')

    if (selectedQuestions.length === 0) {
      throw new Error('No questions available for this exam type')
    }

    // Get current user
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Format questions for test
    const formattedQuestions = selectedQuestions.map((q, index) => ({
      id: `${examType}_${index}_${Date.now()}`,
      questionNumber: index + 1,
      ...q,
    }))

    // Create test record in database
    const { data: testRecord, error: testError } = await supabase
      .from('mock_tests')
      .insert({
        user_id: user.id,
        test_name: config.name,
        exam_type: examType,
        total_questions: config.totalQuestions,
        total_marks: config.totalMarks,
        time_limit_minutes: config.timeLimitMinutes,
        marking_scheme: config.markingScheme,
        difficulty_level: 'average',
      })
      .select()
      .single()

    if (testError) {
      console.error('[v0] Test creation error:', testError)
      throw new Error('Failed to create test')
    }

    console.log('[v0] Test created successfully:', testRecord.id)

    return Response.json({
      success: true,
      test: {
        id: testRecord.id,
        test_name: config.name,
        total_questions: config.totalQuestions,
        total_marks: config.totalMarks,
        time_limit_minutes: config.timeLimitMinutes,
        marking_scheme: config.markingScheme,
        sections: config.sections || null,
        exam_type: examType,
        questions: formattedQuestions,
      },
    })
  } catch (error) {
    console.error('[v0] Error generating test:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate test'
    return Response.json({ error: message }, { status: 500 })
  }
}

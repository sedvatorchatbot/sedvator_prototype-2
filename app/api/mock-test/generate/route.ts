import { createClient } from '@/lib/supabase/server'
import { selectQuestionsWithDistribution, cbseClass10PYQs, jeeMainsPYQs, jeeAdvancedPYQs } from '@/lib/pyq-database'

function getPYQsForExam(examType: string) {
  switch (examType) {
    case 'cbse_9':
    case 'cbse_10':
      return cbseClass10PYQs
    case 'cbse_11':
    case 'cbse_12':
      return cbseClass10PYQs // Can be expanded with class 11/12 specific PYQs
    case 'jee_mains':
      return jeeMainsPYQs
    case 'jee_advanced':
      return jeeAdvancedPYQs
    default:
      return cbseClass10PYQs
  }
}

function getTestConfig(examType: string) {
  const configs: Record<string, any> = {
    cbse_9: {
      name: 'CBSE Class 9 Mock Test',
      totalQuestions: 10,
      totalMarks: 10,
      timeLimitMinutes: 60,
      markingScheme: { correct: 1, incorrect: 0 },
    },
    cbse_10: {
      name: 'CBSE Class 10 Mock Test',
      totalQuestions: 10,
      totalMarks: 10,
      timeLimitMinutes: 60,
      markingScheme: { correct: 1, incorrect: 0 },
    },
    cbse_11: {
      name: 'CBSE Class 11 Mock Test',
      totalQuestions: 10,
      totalMarks: 10,
      timeLimitMinutes: 60,
      markingScheme: { correct: 1, incorrect: 0 },
    },
    cbse_12: {
      name: 'CBSE Class 12 Mock Test',
      totalQuestions: 10,
      totalMarks: 10,
      timeLimitMinutes: 60,
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
      timeLimitMinutes: 180,
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

export async function POST(request: Request) {
  try {
    const { examType, difficulty } = await request.json()

    console.log('[v0] Generating mock test for:', examType, 'difficulty:', difficulty)

    const config = getTestConfig(examType)
    const pyqs = getPYQsForExam(examType)

    // Select questions maintaining PYQ distribution
    const selectedQuestions = selectQuestionsWithDistribution(pyqs, config.totalQuestions, difficulty)

    console.log('[v0] Selected', selectedQuestions.length, 'questions with distribution')

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
        sections: config.sections || null,
        difficulty_level: difficulty,
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

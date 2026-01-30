import { createClient } from '@/lib/supabase/server'
import { getQuestionBank } from '@/lib/mock-question-bank'

export async function POST(request: Request) {
  try {
    const { examType, subject, difficulty } = await request.json()

    console.log('[v0] Generating mock test:', { examType, subject, difficulty })

    // Get pre-generated questions from question bank
    const questionBank = getQuestionBank()
    const bankKey = `${examType}_${subject || 'all'}_${difficulty}`
    const questions = questionBank[bankKey] || []

    if (questions.length === 0) {
      return Response.json(
        { error: `No questions available for ${examType} - ${subject}. Please select a valid exam and subject.` },
        { status: 400 }
      )
    }

    // Shuffle and select 10-75 questions based on exam type
    const isJEE = examType.startsWith('jee_')
    const totalQuestions = isJEE ? 75 : 10
    const selectedQuestions = shuffleArray(questions).slice(0, totalQuestions)

    // Get user
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Determine marking scheme based on exam type
    let markingScheme = { correct: 4, incorrect: -2, unattempted: 0 }
    let totalMarks = 40
    let timeLimitMinutes = 60

    if (examType === 'jee_mains') {
      markingScheme = { correct: 4, incorrect: -2, unattempted: 0 }
      totalMarks = 300
      timeLimitMinutes = 180
    } else if (examType === 'jee_advanced') {
      markingScheme = { correct: 4, incorrect: -2, unattempted: 0 }
      totalMarks = 300
      timeLimitMinutes = 180
    } else if (examType.startsWith('cbse_')) {
      markingScheme = { correct: 1, incorrect: 0, unattempted: 0 }
      totalMarks = 10
      timeLimitMinutes = 60
    }

    // Create test record
    const testName = `${examType.toUpperCase()} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} (${new Date().toLocaleDateString()})`

    const { data: mockTest, error: testError } = await supabase
      .from('mock_tests')
      .insert({
        user_id: user.id,
        exam_type: examType,
        subject: subject || 'all_subjects',
        test_name: testName,
        total_questions: totalQuestions,
        total_marks: totalMarks,
        time_limit_minutes: timeLimitMinutes,
        difficulty_level: difficulty,
        marking_scheme: markingScheme,
        status: 'active',
      })
      .select()
      .single()

    if (testError) {
      console.error('[v0] Test creation error:', testError)
      throw new Error('Failed to create test')
    }

    // Create question records and build questions with metadata
    const questionRecords = selectedQuestions.map((q: any, index: number) => ({
      mock_test_id: mockTest.id,
      question_number: index + 1,
      question_text: q.question,
      question_type: q.type || 'single_correct',
      options: q.options,
      correct_options: Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer],
      marks: q.marks || (isJEE ? 4 : 1),
      negative_marks: q.negativeMarks || (isJEE ? -2 : 0),
      solution: q.explanation || '',
      difficulty: q.difficulty || difficulty,
      topic: q.topic || '',
      pyq_year: q.year || null,
    }))

    const { data: dbQuestions, error: questionsError } = await supabase
      .from('mock_questions')
      .insert(questionRecords)
      .select()

    if (questionsError) {
      console.error('[v0] Questions creation error:', questionsError)
      throw new Error('Failed to create questions')
    }

    // Format response with sections for JEE
    let sections = undefined
    if (isJEE) {
      sections = [
        { subject: 'Physics', mcqCount: 20, integerCount: 5 },
        { subject: 'Chemistry', mcqCount: 20, integerCount: 5 },
        { subject: 'Mathematics', mcqCount: 20, integerCount: 5 },
      ]
    }

    return Response.json({
      success: true,
      mockTest: {
        id: mockTest.id,
        test_name: mockTest.test_name,
        total_questions: mockTest.total_questions,
        total_marks: mockTest.total_marks,
        time_limit_minutes: mockTest.time_limit_minutes,
        marking_scheme: mockTest.marking_scheme,
        exam_type: mockTest.exam_type,
        questions: dbQuestions.map((q: any) => ({
          id: q.id,
          questionNumber: q.question_number,
          questionText: q.question_text,
          questionType: q.question_type,
          options: q.options,
          marks: q.marks,
          topic: q.topic,
        })),
        sections,
      },
    })
  } catch (error) {
    console.error('[v0] Error generating test:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate test'
    return Response.json({ error: message }, { status: 500 })
  }
}

function shuffleArray(array: any[]) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

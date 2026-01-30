import { createClient } from '@/lib/supabase/server'
import { generateMockTestQuestions } from '@/lib/gemini-provider'

export async function POST(request: Request) {
  try {
    const { examType, subject, difficulty, totalQuestions } = await request.json()

    console.log('[v0] Generating mock test:', {
      examType,
      subject,
      difficulty,
      totalQuestions,
    })

    // Validate inputs
    if (!examType || !subject || !difficulty || !totalQuestions) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
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

    // Generate questions using Gemini
    const questionsData = await generateMockTestQuestions(
      examType,
      subject,
      difficulty,
      totalQuestions
    )

    // Determine marking scheme and time limit based on exam type
    let markingScheme = { correct: 4, incorrect: -2, unattempted: 0 }
    let timeLimitMinutes = 180
    let totalMarks = totalQuestions * 4

    switch (examType) {
      case 'cbse_9':
      case 'cbse_10':
      case 'cbse_11':
      case 'cbse_12':
        markingScheme = { correct: 1, incorrect: 0, unattempted: 0 }
        timeLimitMinutes = 60
        totalMarks = totalQuestions
        break
      case 'jee_mains':
        markingScheme = { correct: 4, incorrect: -2, unattempted: 0 }
        timeLimitMinutes = 180
        totalMarks = totalQuestions * 4
        break
      case 'jee_advanced':
        // AI can vary this for JEE Advanced
        markingScheme = { correct: 4, incorrect: -2, unattempted: 0 }
        timeLimitMinutes = 180
        totalMarks = totalQuestions * 4
        break
    }

    // Save test to database
    const { data: mockTest, error: testError } = await supabase
      .from('mock_tests')
      .insert({
        user_id: user.id,
        exam_type: examType,
        subject: subject,
        test_name: `${examType} - ${subject} Mock Test`,
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
      throw new Error('Failed to create mock test')
    }

    // Save questions
    const questionsToInsert = questionsData.questions.map((q: any, index: number) => ({
      mock_test_id: mockTest.id,
      question_number: index + 1,
      question_text: q.question,
      question_type: q.type || 'single_correct',
      options: q.options,
      correct_options: q.correct_options,
      marks: q.marks || 4,
      negative_marks: q.negative_marks || -2,
      solution: q.solution,
      difficulty: q.difficulty || difficulty,
      topic: q.topic,
      pyq_year: q.pyq_year || new Date().getFullYear(),
    }))

    const { data: questions, error: questionsError } = await supabase
      .from('mock_questions')
      .insert(questionsToInsert)
      .select()

    if (questionsError) {
      console.error('[v0] Questions creation error:', questionsError)
      throw new Error('Failed to create questions')
    }

    console.log('[v0] Mock test created:', mockTest.id)

    return Response.json({
      success: true,
      mockTest: {
        ...mockTest,
        questions: questions,
      },
    })
  } catch (error) {
    console.error('[v0] Error generating mock test:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate mock test'
    return Response.json({ error: message }, { status: 500 })
  }
}

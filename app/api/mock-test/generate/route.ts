import { createClient } from '@/lib/supabase/server'
import { generateMockTestQuestions } from '@/lib/gemini-provider'

export async function POST(request: Request) {
  try {
    const { examType, subject, difficulty } = await request.json()

    console.log('[v0] Generating mock test:', {
      examType,
      subject,
      difficulty,
    })

    // Validate inputs
    if (!examType || !difficulty) {
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

    // Determine test configuration based on exam type
    let testConfig: any = {
      markingScheme: { correct: 4, incorrect: -2, unattempted: 0 },
      timeLimitMinutes: 180,
      totalQuestions: 0,
      totalMarks: 0,
      testName: '',
      sections: [],
    }

    if (examType.startsWith('jee_')) {
      // JEE Mains & Advanced: All 3 subjects in one test
      const subjects = ['physics', 'chemistry', 'mathematics']
      const questionsPerSubject = 25 // 20 MCQ + 5 Integer type

      // Generate questions for each subject
      for (const subj of subjects) {
        console.log(`[v0] Generating ${questionsPerSubject} questions for ${subj}`)

        const questionsData = await generateMockTestQuestions(
          examType,
          subj,
          difficulty,
          questionsPerSubject
        )

        testConfig.sections.push({
          subject: subj,
          questions: questionsData.questions,
          mcqCount: 20,
          integerCount: 5,
        })

        testConfig.totalQuestions += questionsPerSubject
      }

      testConfig.totalMarks = 300 // 75 questions * 4 marks each
      testConfig.testName = `${examType === 'jee_mains' ? 'JEE Mains' : 'JEE Advanced'} - Full Test`
    } else {
      // CBSE: Single subject
      if (!subject) {
        return Response.json({ error: 'Subject required for CBSE exams' }, { status: 400 })
      }

      const questionsData = await generateMockTestQuestions(examType, subject, difficulty, 10)

      testConfig.sections.push({
        subject: subject,
        questions: questionsData.questions,
      })

      testConfig.totalQuestions = 10
      testConfig.totalMarks = 10

      if (examType.startsWith('cbse_')) {
        testConfig.markingScheme = { correct: 1, incorrect: 0, unattempted: 0 }
        testConfig.timeLimitMinutes = 60
        testConfig.testName = `CBSE ${examType.split('_')[1].toUpperCase()} - ${subject}`
      }
    }

    // Save test to database
    const { data: test, error: testError } = await supabase
      .from('mock_tests')
      .insert({
        user_id: user.id,
        exam_type: examType,
        subject: subject || 'all_subjects', // For JEE
        test_name: testConfig.testName,
        total_questions: testConfig.totalQuestions,
        total_marks: testConfig.totalMarks,
        time_limit_minutes: testConfig.timeLimitMinutes,
        difficulty_level: difficulty,
        marking_scheme: testConfig.markingScheme,
      })
      .select()
      .single()

    if (testError) {
      console.error('[v0] Test creation error:', testError)
      throw new Error('Failed to create test')
    }

    console.log('[v0] Test created:', test.id)

    // Save all questions
    let questionNumber = 1
    const allQuestions: any[] = []

    for (const section of testConfig.sections) {
      for (const q of section.questions) {
        const { data: question, error: qError } = await supabase
          .from('mock_questions')
          .insert({
            mock_test_id: test.id,
            question_number: questionNumber,
            question_text: q.question,
            question_type: q.type || 'single_correct',
            options: q.options,
            correct_options: q.correctOptions,
            marks: q.marks || 4,
            negative_marks: q.negativeMarks || -2,
            solution: q.solution || '',
            difficulty: q.difficulty || difficulty,
            topic: q.topic || '',
            pyq_year: q.year || new Date().getFullYear() - 1,
          })
          .select()
          .single()

        if (!qError && question) {
          allQuestions.push({
            ...question,
            subject: section.subject,
            mcqType: section.mcqCount && questionNumber <= section.mcqCount ? true : false,
          })
        }

        questionNumber++
      }
    }

    console.log('[v0] Created', allQuestions.length, 'questions')

    return Response.json({
      success: true,
      test: {
        id: test.id,
        ...test,
        questions: allQuestions,
        sections: testConfig.sections.map((s: any) => ({
          subject: s.subject,
          mcqCount: s.mcqCount || 10,
          integerCount: s.integerCount || 0,
        })),
      },
    })
  } catch (error) {
    console.error('[v0] Error generating test:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate test'
    return Response.json({ error: message }, { status: 500 })
  }
}

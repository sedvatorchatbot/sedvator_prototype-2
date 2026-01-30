import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { mockTestId, action, responses, autoSubmit } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (action === 'start') {
      console.log('[v0] Starting mock test:', mockTestId)

      // Create attempt record
      const { data: attempt, error: attemptError } = await supabase
        .from('mock_test_attempts')
        .insert({
          user_id: user.id,
          mock_test_id: mockTestId,
          start_time: new Date().toISOString(),
          status: 'in_progress',
        })
        .select()
        .single()

      if (attemptError) {
        throw new Error('Failed to start test')
      }

      return Response.json({ success: true, attemptId: attempt.id })
    }

    if (action === 'submit' || action === 'auto_submit') {
      console.log('[v0] Submitting mock test attempt:', action)

      const { attemptId } = await request.json()

      // Get attempt
      const { data: attempt, error: getAttemptError } = await supabase
        .from('mock_test_attempts')
        .select('*')
        .eq('id', attemptId)
        .single()

      if (getAttemptError) {
        throw new Error('Attempt not found')
      }

      // Save responses
      const responsesToInsert = responses.map((r: any) => ({
        attempt_id: attemptId,
        question_id: r.questionId,
        selected_options: r.selectedOptions || [],
        time_spent: r.timeSpent || 0,
      }))

      const { error: responsesError } = await supabase
        .from('mock_test_responses')
        .insert(responsesToInsert)

      if (responsesError) {
        throw new Error('Failed to save responses')
      }

      // Calculate scores
      const { data: mockTest } = await supabase
        .from('mock_tests')
        .select('*')
        .eq('id', attempt.mock_test_id)
        .single()

      const { data: questions } = await supabase
        .from('mock_questions')
        .select('*')
        .eq('mock_test_id', attempt.mock_test_id)

      const markingScheme = mockTest.marking_scheme

      let totalCorrect = 0
      let totalIncorrect = 0
      let totalUnattempted = 0
      let totalObtainedMarks = 0

      const responseMap = new Map(responses.map((r: any) => [r.questionId, r.selectedOptions]))

      for (const question of questions) {
        const selectedOptions = responseMap.get(question.id) || []

        if (selectedOptions.length === 0) {
          totalUnattempted++
        } else {
          const isCorrect =
            JSON.stringify(selectedOptions.sort()) ===
            JSON.stringify(question.correct_options.sort())

          if (isCorrect) {
            totalCorrect++
            totalObtainedMarks += question.marks
          } else {
            totalIncorrect++
            totalObtainedMarks += question.negative_marks
          }
        }
      }

      // Update attempt
      const endTime = new Date()
      const startTime = new Date(attempt.start_time)
      const timeSpentSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)

      const { data: updatedAttempt, error: updateError } = await supabase
        .from('mock_test_attempts')
        .update({
          end_time: endTime.toISOString(),
          total_time_spent: timeSpentSeconds,
          obtained_marks: totalObtainedMarks,
          total_marks: mockTest.total_marks,
          status: action === 'auto_submit' ? 'auto_submitted' : 'completed',
        })
        .eq('id', attemptId)
        .select()
        .single()

      if (updateError) {
        throw new Error('Failed to update attempt')
      }

      // Generate analysis
      const accuracy = ((totalCorrect / questions.length) * 100).toFixed(2)

      // Subject-wise analysis
      const subjectWiseAnalysis: Record<string, any> = {}
      for (const question of questions) {
        if (!subjectWiseAnalysis[question.subject]) {
          subjectWiseAnalysis[question.subject] = {
            correct: 0,
            incorrect: 0,
            unattempted: 0,
          }
        }

        const selectedOptions = responseMap.get(question.id) || []
        if (selectedOptions.length === 0) {
          subjectWiseAnalysis[question.subject].unattempted++
        } else {
          const isCorrect =
            JSON.stringify(selectedOptions.sort()) ===
            JSON.stringify(question.correct_options.sort())
          if (isCorrect) {
            subjectWiseAnalysis[question.subject].correct++
          } else {
            subjectWiseAnalysis[question.subject].incorrect++
          }
        }
      }

      // Calculate accuracy for each subject
      for (const subject in subjectWiseAnalysis) {
        const total =
          subjectWiseAnalysis[subject].correct +
          subjectWiseAnalysis[subject].incorrect +
          subjectWiseAnalysis[subject].unattempted
        if (total > 0) {
          subjectWiseAnalysis[subject].accuracy = (
            (subjectWiseAnalysis[subject].correct / total) *
            100
          ).toFixed(2)
        }
      }

      // Difficulty-wise analysis
      const difficultyWiseAnalysis: Record<string, any> = {}
      for (const question of questions) {
        if (!difficultyWiseAnalysis[question.difficulty]) {
          difficultyWiseAnalysis[question.difficulty] = { correct: 0, incorrect: 0 }
        }

        const selectedOptions = responseMap.get(question.id) || []
        if (selectedOptions.length > 0) {
          const isCorrect =
            JSON.stringify(selectedOptions.sort()) ===
            JSON.stringify(question.correct_options.sort())
          if (isCorrect) {
            difficultyWiseAnalysis[question.difficulty].correct++
          } else {
            difficultyWiseAnalysis[question.difficulty].incorrect++
          }
        }
      }

      // Identify strength and weakness areas
      const strengthAreas: string[] = []
      const weaknessAreas: string[] = []

      for (const subject in subjectWiseAnalysis) {
        const accuracy = parseFloat(subjectWiseAnalysis[subject].accuracy)
        if (accuracy >= 70) {
          strengthAreas.push(subject)
        } else if (accuracy < 40) {
          weaknessAreas.push(subject)
        }
      }

      const { data: analysis, error: analysisError } = await supabase
        .from('mock_test_analysis')
        .insert({
          attempt_id: attemptId,
          total_correct: totalCorrect,
          total_incorrect: totalIncorrect,
          total_unattempted: totalUnattempted,
          accuracy_percentage: parseFloat(accuracy),
          subject_wise_analysis: subjectWiseAnalysis,
          difficulty_wise_analysis: difficultyWiseAnalysis,
          strength_areas: strengthAreas,
          weakness_areas: weaknessAreas,
        })
        .select()
        .single()

      if (analysisError) {
        console.error('[v0] Analysis error:', analysisError)
      }

      console.log('[v0] Test submitted successfully')

      return Response.json({
        success: true,
        result: {
          attempt: updatedAttempt,
          analysis: analysis,
          scores: {
            totalCorrect,
            totalIncorrect,
            totalUnattempted,
            totalObtainedMarks,
            accuracy,
          },
        },
      })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[v0] Error in test attempt:', error)
    const message = error instanceof Error ? error.message : 'Test operation failed'
    return Response.json({ error: message }, { status: 500 })
  }
}

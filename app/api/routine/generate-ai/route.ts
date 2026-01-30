import { createClient } from '@/lib/supabase/server'
import { generateAIResponse } from '@/lib/ai-provider'

export async function POST(request: Request) {
  try {
    const { prompt, routineName } = await request.json()

    console.log('[v0] Generating routine with prompt:', prompt)

    // Generate optimal routine using AI
    const message = await generateAIResponse({
      messages: [
        {
          role: 'user',
          content: `You are an expert study routine planner. Create an optimal, realistic study schedule based on this request:

User Request: "${prompt}"

Routine Name: "${routineName}"

Requirements:
1. Create a detailed study schedule with specific time slots
2. Include 15-30 minute breaks between sessions
3. Optimize for cognitive performance (harder subjects in morning if possible)
4. Ensure total study hours match user's availability
5. Balance different subjects appropriately
6. Include session names, subjects, and notes

Return a JSON object with this structure:
{
  "name": "routine name",
  "description": "brief description",
  "daily_hours": number,
  "sessions": [
    {
      "session_name": "session name",
      "subject": "subject",
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "is_break": false,
      "notes": "optional notes"
    }
  ],
  "tips": ["tip1", "tip2", "tip3"]
}

Make sure times are in 24-hour format and create realistic, achievable schedule. Return ONLY valid JSON.`,
        },
      ],
      temperature: 0.7,
      maxTokens: 2000,
    })

    console.log('[v0] AI response:', message.text)

    // Parse the response
    let routineData
    try {
      // Extract JSON from the response
      const jsonMatch = message.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      routineData = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('[v0] JSON parse error:', parseError)
      throw new Error('Failed to parse routine data. Please try again.')
    }

    // Get current user
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    // Validate and clean sessions
    if (!Array.isArray(routineData.sessions)) {
      throw new Error('Invalid session data')
    }

    // Save routine to database
    const { data: routine, error: routineError } = await supabase
      .from('study_routines')
      .insert({
        user_id: user.id,
        name: routineData.name,
        description: routineData.description,
        daily_hours: routineData.daily_hours || 8,
      })
      .select()
      .single()

    if (routineError) {
      console.error('[v0] Routine creation error:', routineError)
      throw new Error('Failed to create routine')
    }

    // Save sessions
    const sessionsToInsert = routineData.sessions.map((session: any) => ({
      routine_id: routine.id,
      user_id: user.id,
      session_name: session.session_name,
      subject: session.subject,
      start_time: session.start_time,
      end_time: session.end_time,
      is_break: session.is_break || false,
      notes: session.notes || '',
    }))

    const { data: sessions, error: sessionsError } = await supabase
      .from('routine_sessions')
      .insert(sessionsToInsert)
      .select()

    if (sessionsError) {
      console.error('[v0] Sessions creation error:', sessionsError)
      throw new Error('Failed to create sessions')
    }

    // Auto-sync reminders
    const remindersToInsert = sessions
      .filter((s: any) => !s.is_break)
      .map((session: any) => ({
        routine_id: routine.id,
        session_id: session.id,
        user_id: user.id,
        reminder_time: session.start_time,
        reminder_type: 'both', // both browser and phone
        is_active: true,
      }))

    const { data: reminders, error: remindersError } = await supabase
      .from('routine_reminders')
      .insert(remindersToInsert)
      .select()

    if (remindersError) {
      console.error('[v0] Reminders creation error:', remindersError)
      throw new Error('Failed to create reminders')
    }

    return new Response(
      JSON.stringify({
        success: true,
        routine: {
          ...routine,
          routine_sessions: sessions,
        },
        reminders,
        remindersCreated: reminders.length,
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error generating routine:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate routine'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500 }
    )
  }
}

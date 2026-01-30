import { createClient } from '@/lib/supabase/server'
import { generateAIResponse } from '@/lib/ai-provider'

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

function insertBreaksIntoSchedule(sessions: any[]): any[] {
  const result: any[] = []

  for (let i = 0; i < sessions.length; i++) {
    result.push(sessions[i])

    // Add break after each session except the last one
    if (i < sessions.length - 1) {
      const currentEnd = timeToMinutes(sessions[i].end_time)
      const nextStart = timeToMinutes(sessions[i + 1].start_time)

      // If there's no gap between sessions, add a 10-minute break
      if (currentEnd === nextStart) {
        const breakStart = minutesToTime(currentEnd)
        const breakEnd = minutesToTime(currentEnd + 10)
        result.push({
          session_name: 'Break',
          subject: 'Rest',
          start_time: breakStart,
          end_time: breakEnd,
          is_break: true,
          notes: 'Short break to refresh',
        })
      }
    }
  }

  return result
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt || !prompt.trim()) {
      return Response.json(
        { error: 'Study goal prompt is required' },
        { status: 400 }
      )
    }

    console.log('[v0] Generating routine from prompt:', prompt)

    // Generate optimal routine using AI
    let message
    try {
      message = await generateAIResponse({
        messages: [
          {
            role: 'user',
            content: `You are an expert study routine planner. Create an optimal, realistic study schedule.

IMPORTANT: Do NOT include breaks in the sessions list - they will be added automatically.

User Goal: "${prompt}"

Instructions:
1. Create study sessions with specific times for each subject
2. Optimize for cognitive performance (harder subjects when fresh, lighter when tired)
3. Balance all subjects mentioned
4. Start time should be 9:00 AM and be realistic
5. Each session: 45-90 minutes
6. Between sessions: natural study flow without explicit breaks

Return ONLY this JSON structure (no markdown, no extra text):
{
  "name": "Physics Exam Prep 2 Weeks",
  "description": "Comprehensive preparation for physics exam",
  "daily_hours": 8,
  "sessions": [
    {
      "session_name": "Mechanics Deep Dive",
      "subject": "Mechanics",
      "start_time": "09:00",
      "end_time": "10:30",
      "is_break": false,
      "notes": "Focus on problem solving"
    },
    {
      "session_name": "Thermodynamics Concepts",
      "subject": "Thermodynamics",
      "start_time": "10:45",
      "end_time": "12:15",
      "is_break": false,
      "notes": "Understand key principles"
    }
  ]
}

Ensure times are in HH:MM format (24-hour). Return ONLY valid JSON.`,
          },
        ],
        temperature: 0.7,
        maxTokens: 2000,
      })
    } catch (aiError) {
      console.error('[v0] AI generation error:', aiError)
      return Response.json(
        { error: `AI generation failed: ${aiError instanceof Error ? aiError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    console.log('[v0] AI response received')

    // Parse the response
    let routineData
    try {
      const responseText =
        typeof message === 'string' ? message : message.text || message.content || ''
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        console.error('[v0] No JSON found in response:', responseText)
        throw new Error('Invalid response format from AI')
      }

      routineData = JSON.parse(jsonMatch[0])
      console.log('[v0] Parsed routine data:', routineData.name)
    } catch (parseError) {
      console.error('[v0] JSON parse error:', parseError)
      throw new Error('Failed to parse routine data. Please try again.')
    }

    // Validate sessions
    if (!Array.isArray(routineData.sessions) || routineData.sessions.length === 0) {
      throw new Error('No study sessions generated')
    }

    // Insert breaks automatically
    const sessionsWithBreaks = insertBreaksIntoSchedule(routineData.sessions)
    console.log('[v0] Added automatic breaks. Total sessions:', sessionsWithBreaks.length)

    // Get current user
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Save routine to database
    const { data: routine, error: routineError } = await supabase
      .from('study_routines')
      .insert({
        user_id: user.id,
        name: routineData.name || 'Study Routine',
        description: routineData.description || 'AI-generated study routine',
        daily_hours: routineData.daily_hours || 8,
      })
      .select()
      .single()

    if (routineError) {
      console.error('[v0] Routine creation error:', routineError)
      throw new Error('Failed to create routine')
    }

    // Save sessions with breaks
    const sessionsToInsert = sessionsWithBreaks.map((session: any) => ({
      routine_id: routine.id,
      session_name: session.session_name,
      subject: session.subject || 'Study',
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

    // Auto-sync reminders for non-break sessions only
    const remindersToInsert = sessions
      .filter((s: any) => !s.is_break)
      .map((session: any) => ({
        routine_id: routine.id,
        session_id: session.id,
        user_id: user.id,
        reminder_time: session.start_time,
        reminder_type: 'both',
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

    console.log('[v0] Routine created successfully with', reminders.length, 'reminders')

    return Response.json({
      success: true,
      routine: {
        ...routine,
        routine_sessions: sessions,
      },
      reminders,
      remindersCreated: reminders.length,
    })
  } catch (error) {
    console.error('[v0] Error generating routine:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate routine'
    return Response.json({ error: message }, { status: 500 })
  }
}

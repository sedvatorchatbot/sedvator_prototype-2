import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, daily_hours, sessions } = body

    if (!name || !daily_hours || !sessions || sessions.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create the routine
    const { data: routine, error: routineError } = await supabase
      .from("study_routines")
      .insert({
        user_id: user.id,
        name,
        daily_hours,
      })
      .select()
      .single()

    if (routineError || !routine) {
      throw routineError || new Error("Failed to create routine")
    }

    // Create sessions
    const sessionData = sessions.map((session: any, index: number) => ({
      routine_id: routine.id,
      session_name: session.sessionName,
      subject: session.subject || null,
      start_time: session.startTime,
      end_time: session.endTime,
      duration_minutes: calculateDurationMinutes(
        session.startTime,
        session.endTime
      ),
      session_order: index + 1,
      is_break: session.isBreak || false,
      notes: session.notes || null,
    }))

    const { data: createdSessions, error: sessionsError } = await supabase
      .from("routine_sessions")
      .insert(sessionData)
      .select()

    if (sessionsError) {
      throw sessionsError
    }

    // Auto-create reminders for all sessions
    const reminderData = createdSessions
      .filter((session: any) => !session.is_break)
      .map((session: any) => ({
        user_id: user.id,
        session_id: session.id,
        routine_id: routine.id,
        reminder_time: session.start_time,
        reminder_type: "both",
        is_active: true,
      }))

    const { error: remindersError } = await supabase
      .from("routine_reminders")
      .insert(reminderData)

    if (remindersError) {
      console.error("Error creating reminders:", remindersError)
    }

    // Update notification permissions if not already set
    const { data: permissions } = await supabase
      .from("notification_permissions")
      .select()
      .eq("user_id", user.id)
      .maybeSingle()

    if (!permissions) {
      await supabase.from("notification_permissions").insert({
        user_id: user.id,
        browser_notifications_enabled: false,
        phone_notifications_enabled: false,
      })
    }

    return NextResponse.json(
      {
        success: true,
        routine,
        sessions: createdSessions,
        remindersCreated: reminderData.length,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Routine creation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create routine" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: routines, error } = await supabase
      .from("study_routines")
      .select(
        `
        *,
        routine_sessions(*)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(routines)
  } catch (error: any) {
    console.error("Error fetching routines:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch routines" },
      { status: 500 }
    )
  }
}

function calculateDurationMinutes(startTime: string, endTime: string): number {
  const start = new Date(`2024-01-01T${startTime}`)
  const end = new Date(`2024-01-01T${endTime}`)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
}

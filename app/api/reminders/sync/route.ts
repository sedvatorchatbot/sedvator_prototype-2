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
    const { routine_id } = body

    if (!routine_id) {
      return NextResponse.json(
        { error: "Missing routine_id" },
        { status: 400 }
      )
    }

    // Get all sessions for the routine
    const { data: sessions, error: sessionsError } = await supabase
      .from("routine_sessions")
      .select("*")
      .eq("routine_id", routine_id)
      .eq("is_break", false)

    if (sessionsError) {
      throw sessionsError
    }

    // Delete existing reminders for this routine
    const { error: deleteError } = await supabase
      .from("routine_reminders")
      .delete()
      .eq("routine_id", routine_id)
      .eq("user_id", user.id)

    if (deleteError) {
      console.error("Error deleting old reminders:", deleteError)
    }

    // Create new reminders for all sessions
    const reminderData = sessions!.map((session: any) => ({
      user_id: user.id,
      session_id: session.id,
      routine_id: routine_id,
      reminder_time: session.start_time,
      reminder_type: "both",
      is_active: true,
    }))

    const { data: reminders, error: remindersError } = await supabase
      .from("routine_reminders")
      .insert(reminderData)
      .select()

    if (remindersError) {
      throw remindersError
    }

    return NextResponse.json(
      {
        success: true,
        remindersCreated: reminders!.length,
        reminders,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Reminder sync error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to sync reminders" },
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

    const { data: reminders, error } = await supabase
      .from("routine_reminders")
      .select(
        `
        *,
        routine_sessions(*)
      `
      )
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("reminder_time", { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json(reminders)
  } catch (error: any) {
    console.error("Error fetching reminders:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch reminders" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { reminder_id, is_active } = body

    if (!reminder_id) {
      return NextResponse.json(
        { error: "Missing reminder_id" },
        { status: 400 }
      )
    }

    const { data: reminder, error } = await supabase
      .from("routine_reminders")
      .update({
        is_active: is_active !== undefined ? is_active : true,
        last_notified: new Date().toISOString(),
      })
      .eq("id", reminder_id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(reminder)
  } catch (error: any) {
    console.error("Error updating reminder:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update reminder" },
      { status: 500 }
    )
  }
}

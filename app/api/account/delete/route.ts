import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Get the current user from the server-side client
    const supabase = await createServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = user.id

    // Delete all user data from tables
    await Promise.all([
      supabase.from("chat_messages").delete().eq("user_id", userId),
      supabase.from("flashcard_sets").delete().eq("user_id", userId),
      supabase.from("game_scores").delete().eq("user_id", userId),
      supabase.from("quiz_attempts").delete().eq("user_id", userId),
      supabase.from("quizzes").delete().eq("user_id", userId),
      supabase.from("reminders").delete().eq("user_id", userId),
      supabase.from("study_routines").delete().eq("user_id", userId),
      supabase.from("profiles").delete().eq("id", userId),
    ])

    // Create admin client with service role key to delete the auth user
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Delete the user from Supabase Auth using admin privileges
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error("Error deleting auth user:", deleteError)
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}

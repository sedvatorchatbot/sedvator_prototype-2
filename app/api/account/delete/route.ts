import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Deletes the caller's auth user; all owned rows are removed via ON DELETE CASCADE.
    const { error: deleteError } = await supabase.rpc("delete_current_user")

    if (deleteError) {
      console.error("Error deleting account:", deleteError)
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
    }

    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}

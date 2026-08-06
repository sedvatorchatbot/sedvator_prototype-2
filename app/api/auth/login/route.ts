import { createClient } from "@/lib/supabase/server"
import { retryWithBackoff } from "@/lib/retry"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Retry the authentication with exponential backoff
    const { data, error } = await retryWithBackoff(async () => {
      const supabase = await createClient()
      return supabase.auth.signInWithPassword({
        email,
        password,
      })
    })

    if (error) {
      console.error("[v0] Supabase auth error:", error)
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!data.session) {
      return NextResponse.json({ error: "No session created" }, { status: 401 })
    }

    return NextResponse.json({ success: true, user: data.user })
  } catch (error) {
    console.error("[v0] Login API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

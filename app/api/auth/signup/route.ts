import { createClient } from "@/lib/supabase/server"
import { retryWithBackoff } from "@/lib/retry"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password, displayName } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Retry the signup with exponential backoff
    const { data, error } = await retryWithBackoff(async () => {
      const supabase = await createClient()
      return supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || process.env.NEXT_PUBLIC_SUPABASE_URL}/chat`,
          data: {
            display_name: displayName || email.split("@")[0],
          },
        },
      })
    })

    if (error) {
      console.error("[v0] Supabase signup error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: "Sign up successful! Please check your email to confirm.",
    })
  } catch (error) {
    console.error("[v0] Signup API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

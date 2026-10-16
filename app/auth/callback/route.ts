import { createClient } from "@/lib/supabase/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const nextParam = searchParams.get("next") ?? "/chat"
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/chat"

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  // The email is already confirmed by Supabase before redirecting here, so if the
  // session exchange fails (e.g. link opened in a different browser) the user can just log in.
  return NextResponse.redirect(`${origin}/auth/login?confirmed=1`)
}

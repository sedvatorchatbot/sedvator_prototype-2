import { createClient } from "@/lib/supabase/server"
import { ChatInterface } from "@/components/chat-interface"

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow guest access - don't require authentication
  const isGuest = !user || user.is_anonymous === true

  let profile = null

  // Always ensure a profile exists before rendering onboarding. The auth trigger
  // normally creates it, but upsert also handles users created before the trigger
  // was installed or a delayed trigger in a fresh Supabase project.
  if (user && !isGuest) {
    const { data: ensuredProfile, error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email ?? null,
          display_name:
            user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "Student",
        },
        { onConflict: "id" },
      )
      .select("*")
      .single()

    if (profileError) {
      console.error("[v0] Failed to load or create profile:", profileError)
    } else {
      profile = ensuredProfile
    }
  }

  return <ChatInterface user={user} profile={profile} isGuest={isGuest} />
}

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

  // Only fetch profile if user is authenticated
  if (user && !isGuest) {
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (!existingProfile) {
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          name: undefined,
          grade: "",
          subjects: [],
          chat_history_enabled: true,
        })
        .select()
        .single()

      profile = newProfile
    } else {
      profile = existingProfile
    }
  }

  return <ChatInterface user={user} profile={profile} isGuest={isGuest} />
}

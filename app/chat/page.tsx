import { createClient } from "@/lib/supabase/server"
import { ChatInterface } from "@/components/chat-interface"
import { redirect } from "next/navigation"

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login?redirectTo=/chat")
  }

  const isGuest = user.is_anonymous === true

  let { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  if (!profile) {
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email || `guest_${user.id.slice(0, 8)}@guest.local`,
        name: isGuest ? "Guest User" : undefined,
        grade: "",
        subjects: [],
        chat_history_enabled: !isGuest,
      })
      .select()
      .single()

    profile = newProfile
  }

  return <ChatInterface user={user} profile={profile} isGuest={isGuest} />
}

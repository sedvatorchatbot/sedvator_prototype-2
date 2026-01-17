import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RoutineDashboard } from "@/components/routine-dashboard"

export default async function RoutinePage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get existing routines
  const { data: routines } = await supabase
    .from("study_routines")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get reminders
  const { data: reminders } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <RoutineDashboard
      user={user}
      profile={profile}
      initialRoutines={routines || []}
      initialReminders={reminders || []}
    />
  )
}

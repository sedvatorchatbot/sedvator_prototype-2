import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { GamesHub } from "@/components/games-hub"

export default async function GamesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirectTo=/games")
  }

  // Fetch user's quizzes and flashcard sets
  const [quizzesRes, flashcardsRes, scoresRes] = await Promise.all([
    supabase.from("quizzes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("flashcard_sets").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("game_scores").select("*").eq("user_id", user.id).order("score", { ascending: false }).limit(10),
  ])

  return (
    <GamesHub
      quizzes={quizzesRes.data || []}
      flashcardSets={flashcardsRes.data || []}
      topScores={scoresRes.data || []}
    />
  )
}

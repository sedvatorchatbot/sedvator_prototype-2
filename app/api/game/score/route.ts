import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { gameType, score, streak, timeTaken, metadata } = await request.json()

    const { data, error } = await supabase
      .from("game_scores")
      .insert({
        user_id: user.id,
        game_type: gameType,
        score,
        streak,
        time_taken: timeTaken,
        metadata,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ gameScore: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const gameType = searchParams.get("gameType")

    let query = supabase
      .from("game_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (gameType) {
      query = query.eq("game_type", gameType)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ scores: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

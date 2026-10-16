import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const TABLES = {
  quizzes: "quizzes",
  flashcards: "flashcard_sets",
} as const

export async function DELETE(_request: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  try {
    const { type, id } = await params
    const table = TABLES[type as keyof typeof TABLES]
    if (!table || !id) return NextResponse.json({ error: "Invalid content type or id" }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { error } = await supabase.from(table).delete().eq("id", id).eq("user_id", user.id)
    if (error) throw error
    return NextResponse.json({ deleted: true })
  } catch (error: any) {
    console.error("Study content delete error:", error)
    return NextResponse.json({ error: "Unable to delete this item. Please try again." }, { status: 500 })
  }
}

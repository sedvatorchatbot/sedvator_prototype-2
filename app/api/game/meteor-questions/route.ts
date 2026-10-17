import { createClient } from "@/lib/supabase/server"
import { generateWithAI } from "@/lib/ai-provider"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { topic, difficulty, count = 12 } = await request.json()
    const safeTopic = typeof topic === "string" ? topic.trim().slice(0, 120) : ""
    if (!safeTopic) return NextResponse.json({ error: "A topic is required" }, { status: 400 })

    const prompt = `Create ${Math.min(Math.max(Number(count) || 12, 6), 20)} short-answer questions for a meteor spelling game.
Topic: "${safeTopic}"
Difficulty: ${difficulty || "medium"}

Strict rules:
- Every question and answer must be directly about the exact topic above.
- Never use examples from mathematics, computer science, biology, history, or another subject unless that is the requested topic.
- Do not append the topic to an unrelated question.
- Answers must be short (one to five words), unambiguous, and spellable.
- Return ONLY a valid JSON array with objects shaped exactly like {"question":"...","answer":"..."}.
- No markdown, commentary, or duplicate questions.`

    const raw = await generateWithAI(prompt)
    const start = raw.indexOf("[")
    const end = raw.lastIndexOf("]")
    if (start < 0 || end < start) throw new Error("AI returned invalid question data")
    const parsed = JSON.parse(raw.slice(start, end + 1))
    const questions = Array.isArray(parsed)
      ? parsed.filter((item) => item && typeof item.question === "string" && typeof item.answer === "string")
        .map((item) => ({ question: item.question.trim(), answer: item.answer.trim() }))
        .filter((item) => item.question && item.answer && item.answer.split(/\s+/).length <= 5)
      : []

    if (questions.length < 3) throw new Error("AI returned too few topic questions")
    return NextResponse.json({ questions })
  } catch (error) {
    console.error("[v0] Meteor question generation failed", error)
    return NextResponse.json({ error: "Unable to generate topic questions" }, { status: 500 })
  }
}

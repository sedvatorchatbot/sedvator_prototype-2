import { NextResponse } from "next/server"
import { generateAIResponse } from "@/lib/ai-provider"

export async function POST(request: Request) {
  try {
    const { topic, cards } = await request.json()
    const cleanTopic = typeof topic === "string" ? topic.trim() : ""
    const safeCards = Array.isArray(cards)
      ? cards.slice(0, 40).map((card) => ({
          term: String(card?.term || ""),
          definition: String(card?.definition || ""),
        }))
      : []

    if (!cleanTopic && safeCards.length === 0) {
      return NextResponse.json({ error: "A topic or flashcard content is required" }, { status: 400 })
    }

    const response = await generateAIResponse({
      systemPrompt: `You select one challenging answer word for a Wordle-style educational game. Return ONLY valid JSON with exactly one key: answer. The answer must be a single English word, 4 to 8 letters long, lowercase, with no spaces, punctuation, hyphens, digits, or accents. It must be strongly related to the supplied topic and flashcard content, specific rather than generic, and appropriate for the requested difficulty. Do not use common generic words such as learn, study, topic, thing, concept, answer, knowledge, or school. Choose a word whose spelling is unambiguous.`,
      messages: [{
        role: "user",
        content: JSON.stringify({
          topic: cleanTopic,
          difficulty: "challenging",
          flashcards: safeCards,
          instruction: "Choose a hard, topic-specific word. Vary the length naturally between 4 and 8 letters; do not default to five letters.",
        }),
      }],
      temperature: 0.9,
      maxTokens: 120,
    })

    const parsed = JSON.parse(response.replace(/```json|```/g, "").trim())
    const answer = String(parsed.answer || "").toLowerCase().replace(/[^a-z]/g, "")
    if (answer.length < 4 || answer.length > 8) throw new Error("AI returned an invalid answer length")

    return NextResponse.json({ answer })
  } catch (error) {
    console.error("[v0] Genius Guesser generation failed", error)
    return NextResponse.json({ error: "Could not generate a topic-specific word" }, { status: 502 })
  }
}

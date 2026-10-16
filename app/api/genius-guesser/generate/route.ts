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

    const fallbackWords = [
      ...safeCards.flatMap((card) => [card.term, card.definition.split(/[\s,.;:()[\]{}]+/)[0]]),
      ...cleanTopic.split(/[\s,.;:()[\]{}_-]+/),
    ]
      .map((word) => word.toLowerCase().replace(/[^a-z]/g, ""))
      .filter((word) => word.length >= 4 && word.length <= 8)

    const fallback = fallbackWords[0] || "syntax"
    const generateFallback = () => NextResponse.json({ answer: fallback, fallback: true })

    try {
      const response = await Promise.race([
        generateAIResponse({
          systemPrompt: `Select one challenging, topic-specific answer word for a Wordle-style educational game. Return ONLY valid JSON with exactly one key: answer. The answer must be one English word, 4 to 8 letters long, lowercase, with no spaces, punctuation, digits, or accents. It must come directly from or clearly relate to the supplied topic or flashcards. Avoid generic words such as learn, study, topic, thing, concept, answer, knowledge, or school. Vary the length naturally; do not default to five letters.`,
          messages: [{ role: "user", content: JSON.stringify({ topic: cleanTopic, difficulty: "challenging", flashcards: safeCards }) }],
          temperature: 0.7,
          maxTokens: 60,
        }),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error("generation timeout")), 12000)),
      ])
      const parsed = JSON.parse(response.replace(/```json|```/g, "").trim())
      const answer = String(parsed.answer || "").toLowerCase().replace(/[^a-z]/g, "")
      if (answer.length >= 4 && answer.length <= 8) return NextResponse.json({ answer })
    } catch (error) {
      console.warn("[v0] Genius Guesser using deterministic fallback", error)
    }

    return generateFallback()
  } catch (error) {
    console.error("[v0] Genius Guesser generation failed", error)
    return NextResponse.json({ error: "Could not generate a topic-specific word" }, { status: 502 })
  }
}

import { createClient } from "@/lib/supabase/server"
import { generateWithAI } from "@/lib/ai-provider"
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

    const { topic, content, sourceType, difficulty = "intermediate", cardCount = 15 } = await request.json()

    const difficultyInstructions = {
      basic:
        "Create simple flashcards with basic terms and straightforward definitions. Use clear, easy-to-understand language.",
      intermediate:
        "Create flashcards that cover core concepts with clear explanations. Include some contextual information.",
      advanced: "Create detailed flashcards with comprehensive definitions. Include nuances and related concepts.",
      expert: "Create in-depth flashcards with advanced terminology. Include complex relationships between concepts.",
    }

    const difficultyPrompt =
      difficultyInstructions[difficulty as keyof typeof difficultyInstructions] || difficultyInstructions.intermediate

    const prompt =
      sourceType === "pdf"
        ? `Based on the following study material, generate ${cardCount} flashcards for memorization.

Difficulty Level: ${difficulty.toUpperCase()}
${difficultyPrompt}

Study Material:
${content}

Return ONLY a valid JSON array with this exact format, no other text:
[
  {
    "term": "Key term or concept",
    "definition": "Clear, concise definition or explanation"
  }
]`
        : `Generate ${cardCount} flashcards about: ${topic}

Difficulty Level: ${difficulty.toUpperCase()}
${difficultyPrompt}

The flashcards should be educational and help students memorize key concepts.

Return ONLY a valid JSON array with this exact format, no other text:
[
  {
    "term": "Key term or concept",
    "definition": "Clear, concise definition or explanation"
  }
]`

    const response = await generateWithAI(prompt)

    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error("Failed to parse flashcards")
    }

    const cards = JSON.parse(jsonMatch[0])

    const { data: flashcardSet, error } = await supabase
      .from("flashcard_sets")
      .insert({
        user_id: user.id,
        title: sourceType === "pdf" ? "Flashcards from Notes" : `Flashcards: ${topic}`,
        topic: topic || "From uploaded notes",
        cards: cards,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ flashcardSet, cards })
  } catch (error: any) {
    console.error("Flashcard generation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

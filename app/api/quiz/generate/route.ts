import { createClient } from "@/lib/supabase/server"
import { generateWithAI } from "@/lib/ai-provider"
import { NextResponse } from "next/server"

function sanitizeJSON(str: string): string {
  // Remove markdown code blocks
  str = str.replace(/```json\s*/gi, "").replace(/```\s*/gi, "")

  // Find the JSON array
  const startIndex = str.indexOf("[")
  const endIndex = str.lastIndexOf("]")

  if (startIndex === -1 || endIndex === -1) {
    throw new Error("No JSON array found")
  }

  str = str.slice(startIndex, endIndex + 1)

  // Fix common JSON issues
  // Remove trailing commas before ] or }
  str = str.replace(/,\s*}/g, "}")
  str = str.replace(/,\s*\]/g, "]")

  // Fix unescaped quotes in strings (basic attempt)
  // Replace smart quotes with regular quotes
  str = str.replace(/[""]/g, '"')
  str = str.replace(/['']/g, "'")

  // Remove control characters except newlines and tabs
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")

  // Fix potential issues with explanation fields containing special chars
  str = str.replace(/\n/g, " ").replace(/\r/g, " ").replace(/\t/g, " ")

  return str
}

function hasUsableQuestions(questions: any[]): boolean {
  return (
    Array.isArray(questions) &&
    questions.length > 0 &&
    questions.every(
      (q) =>
        typeof q?.question === "string" &&
        q.question.trim().length > 10 &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.options.every((option: unknown) => typeof option === "string" && option.trim().length > 2) &&
        typeof q.correctIndex === "number" &&
        q.correctIndex >= 0 &&
        q.correctIndex < 4,
    )
  )
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { topic, content, sourceType, difficulty = "intermediate", questionCount = 5 } = await request.json()

    const safeQuestionCount = Math.min(questionCount, 5)

    const difficultyInstructions = {
      basic: "Simple questions with basic definitions.",
      intermediate: "Balanced questions testing understanding.",
      advanced: "Challenging questions requiring analysis.",
      expert: "Complex questions requiring critical thinking.",
    }

    const difficultyPrompt =
      difficultyInstructions[difficulty as keyof typeof difficultyInstructions] || difficultyInstructions.intermediate

    const prompt =
      sourceType === "pdf"
        ? `Generate ${safeQuestionCount} multiple choice questions from this material. ${difficultyPrompt}

Material: ${content.slice(0, 2000)}

IMPORTANT: Return ONLY valid JSON array. No markdown. No extra text.
Format: [{"question":"Q?","options":["A","B","C","D"],"correctIndex":0,"explanation":"Why"}]
For math: calculate correctly (e.g., 8+4+3=15).`
        : `Generate ${safeQuestionCount} multiple choice questions about "${topic}". ${difficultyPrompt}

IMPORTANT: Return ONLY valid JSON array. No markdown. No extra text.
Format: [{"question":"Q?","options":["A","B","C","D"],"correctIndex":0,"explanation":"Why"}]
For math: calculate correctly (e.g., 8+4+3=15).`

    const response = await generateWithAI(prompt)

    let questions: any[] = []

    try {
      questions = JSON.parse(sanitizeJSON(response))
    } catch (parseError) {
      console.error("[v0] Quiz JSON parse failed:", parseError)
    }

    if (!hasUsableQuestions(questions)) {
      const retryPrompt = `${prompt}

Your previous response was unusable. Regenerate every question with four complete, distinct answer choices.
Never use placeholders such as "Definition A", "Statement 1", "Option A", or letters alone.
The correctIndex must point to the one correct choice. Return only the JSON array.`
      try {
        questions = JSON.parse(sanitizeJSON(await generateWithAI(retryPrompt)))
      } catch (retryError) {
        console.error("[v0] Quiz retry failed:", retryError)
      }
    }

    if (!hasUsableQuestions(questions)) {
      throw new Error("The quiz generator returned incomplete answer choices. Please try again.")
    }

    questions = questions.slice(0, safeQuestionCount).map((q: any) => ({
      question: q.question.trim(),
      options: q.options.map((option: string) => option.trim()),
      correctIndex: q.correctIndex,
      explanation: typeof q.explanation === "string" ? q.explanation.trim() : "See the correct answer above.",
    }))

    // Save quiz to database
    const { data: quiz, error } = await supabase
      .from("quizzes")
      .insert({
        user_id: user.id,
        title: sourceType === "pdf" ? "Quiz from Notes" : `Quiz: ${topic}`,
        topic: topic || "From uploaded notes",
        source_type: sourceType,
        questions: questions,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ quiz: { ...quiz, difficulty }, questions })
  } catch (error: any) {
    console.error("Quiz generation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

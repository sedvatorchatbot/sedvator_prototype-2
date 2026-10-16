import { createClient } from "@/lib/supabase/server"
import { generateAIResponse } from "@/lib/ai-provider"
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

function generateFallbackQuiz(topic: string, count: number): any[] {
  const questions = [
    {
      question: `What is the main concept of ${topic}?`,
      options: ["Definition A", "Definition B", "Definition C", "Definition D"],
      correctIndex: 0,
      explanation: "This is the fundamental definition.",
    },
    {
      question: `Which of the following is true about ${topic}?`,
      options: ["Statement 1", "Statement 2", "Statement 3", "Statement 4"],
      correctIndex: 0,
      explanation: "This statement accurately describes the concept.",
    },
    {
      question: `How is ${topic} commonly applied?`,
      options: ["Application A", "Application B", "Application C", "Application D"],
      correctIndex: 0,
      explanation: "This is a common application.",
    },
  ]
  return questions.slice(0, Math.min(count, 3))
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
Each option must be a complete, distinct, factually meaningful answer. Never use placeholders like "Statement 1", "Option A", "Definition A", or "Application A". The correct answer must appear verbatim in options and correctIndex must identify it.
Format: [{"question":"Q?","options":["A complete answer","A plausible distractor","Another plausible distractor","Another plausible distractor"],"correctIndex":0,"explanation":"Why"}]
For math: calculate correctly (e.g., 8+4+3=15).`
        : `Generate ${safeQuestionCount} multiple choice questions about "${topic}". ${difficultyPrompt}

IMPORTANT: Return ONLY valid JSON array. No markdown. No extra text.
Each option must be a complete, distinct, factually meaningful answer. Never use placeholders like "Statement 1", "Option A", "Definition A", or "Application A". The correct answer must appear verbatim in options and correctIndex must identify it.
Format: [{"question":"Q?","options":["A complete answer","A plausible distractor","Another plausible distractor","Another plausible distractor"],"correctIndex":0,"explanation":"Why"}]
For math: calculate correctly (e.g., 8+4+3=15).`

    const response = await generateAIResponse({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      maxTokens: 2048,
    })

    let questions: any[]

    try {
      const cleanedJson = sanitizeJSON(response)
      questions = JSON.parse(cleanedJson)
    } catch (parseError) {
      console.error("JSON parse failed, trying secondary cleanup:", parseError)

      try {
        let str = response
        // Extract just the array content using regex
        const match = str.match(/\[\s*\{[\s\S]*?\}\s*\]/g)
        if (match) {
          str = match[0]
            .replace(/,\s*}/g, "}")
            .replace(/,\s*\]/g, "]")
            .replace(/[\n\r\t]/g, " ")
          questions = JSON.parse(str)
        } else {
          throw new Error("No valid JSON found")
        }
      } catch {
        throw new Error("The AI returned invalid quiz JSON. Please try again.")
      }
    }

    // Validate the model output so placeholder options never reach the game UI.
    questions = questions
      .map((q: any) => {
        const options = Array.isArray(q.options)
          ? q.options.map((option: unknown) => String(option).trim()).filter(Boolean).slice(0, 4)
          : []
        const correctIndex = typeof q.correctIndex === "number" ? q.correctIndex : -1
        const hasPlaceholders = (options as string[]).some((option: string) => /^(statement|option|definition|application)\s*[a-d0-9]+$/i.test(option))
        if (!q.question || options.length !== 4 || correctIndex < 0 || correctIndex >= 4 || hasPlaceholders) return null
        return {
          question: String(q.question).trim(),
          options,
          correctIndex,
          explanation: String(q.explanation || "See the correct answer above.").trim(),
        }
      })
      .filter(Boolean)

    if (!questions.length) {
      throw new Error("The AI returned unusable quiz questions. Please try again.")
    }

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

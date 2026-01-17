import { NextResponse } from "next/server"
import { generateAIResponse } from "@/lib/ai-provider"

interface MoodRequest {
  message: string
  grade: string
}

export async function POST(request: Request) {
  try {
    const { message, grade }: MoodRequest = await request.json()

    const systemPrompt = `You are a supportive study companion for a ${grade} student. They seem to be struggling emotionally or feeling demotivated. Please:
1. Acknowledge their feelings with empathy
2. Provide encouragement and perspective
3. Suggest one small, actionable step they can take right now
4. End with a positive, motivating statement

Keep it conversational, warm, and appropriate for their grade level. About 3-4 sentences.`

    const text = await generateAIResponse({
      systemPrompt,
      messages: [{ role: "user", content: message }],
      temperature: 0.8,
      maxTokens: 512,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Mood API error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}

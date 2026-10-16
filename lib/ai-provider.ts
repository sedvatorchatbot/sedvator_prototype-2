import { GoogleGenerativeAI } from "@google/generative-ai"
import { createGateway, generateText } from "ai"

interface GenerateOptions {
  systemPrompt?: string
  messages: { role: "user" | "assistant"; content: string }[]
  temperature?: number
  maxTokens?: number
}

const gateway = createGateway()
const primaryModel = gateway("openai/gpt-oss-120b")
const fallbackModel = gateway("google/gemini-2.5-flash")

export async function generateAIResponse(options: GenerateOptions): Promise<string> {
  const { systemPrompt, messages, temperature = 0.7, maxTokens = 1024 } = options

  const request = {
    system: systemPrompt,
    messages: messages.map((message) => ({
      role: message.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: message.content,
    })),
    temperature,
    maxOutputTokens: maxTokens,
  }

  try {
    const result = await generateText({ model: primaryModel, ...request })
    if (!result.text.trim()) throw new Error("The AI returned an empty response")
    return result.text
  } catch (gatewayError) {
    console.error("[v0] AI Gateway unavailable, trying configured Gemini fallback", gatewayError)
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("AI service is unavailable")
  }

  const gemini = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: "gemini-3.8-flash",
    ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
  })
  try {
    const result = await gemini.generateContent({
      contents: messages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      })),
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    })
    const text = result.response.text().trim()
    if (text) return text
  } catch (geminiError) {
    console.error("[v0] Gemini fallback unavailable, trying Groq", geminiError)
  }

  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) throw new Error("AI service is unavailable")

  const groqMessages = [
    ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
    ...messages.map((message) => ({ role: message.role, content: message.content })),
  ]
  const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
    body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: groqMessages, temperature, max_tokens: maxTokens }),
  })
  if (!groqResponse.ok) throw new Error(`Groq request failed with status ${groqResponse.status}`)
  const groqData = await groqResponse.json()
  const groqText = groqData.choices?.[0]?.message?.content?.trim()
  if (!groqText) throw new Error("The AI returned an empty response")
  return groqText
}

export async function generateWithAI(prompt: string): Promise<string> {
  return generateAIResponse({
    messages: [{ role: "user", content: prompt }],
    maxTokens: 2048,
  })
}

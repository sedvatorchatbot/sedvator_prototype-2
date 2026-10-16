import { createGateway, generateText } from "ai"

interface GenerateOptions {
  systemPrompt?: string
  messages: { role: string; content: string }[]
  temperature?: number
  maxTokens?: number
}

const gateway = createGateway()
const model = gateway("openai/gpt-oss-120b")

export async function generateAIResponse(options: GenerateOptions): Promise<string> {
  const { systemPrompt, messages, temperature = 0.7, maxTokens = 1024 } = options

  const result = await generateText({
    model,
    system: systemPrompt,
    messages: messages.map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content,
    })),
    temperature,
    maxOutputTokens: maxTokens,
  })

  if (!result.text.trim()) {
    throw new Error("The AI returned an empty response")
  }

  return result.text
}

export async function generateWithAI(prompt: string): Promise<string> {
  return generateAIResponse({
    messages: [{ role: "user", content: prompt }],
    maxTokens: 2048,
  })
}

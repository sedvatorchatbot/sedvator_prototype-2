// Unified AI provider with Gemini -> Groq fallback
// Gemini is tried first, falls back to Groq on rate limits

interface GenerateOptions {
  systemPrompt?: string
  messages: { role: string; content: string }[]
  temperature?: number
  maxTokens?: number
}

// Unified AI provider - Groq only (free tier)

export async function generateAIResponse(options: GenerateOptions): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured. Please add it in the Vars panel.")
  }

  const { systemPrompt, messages, temperature = 0.7, maxTokens = 1024 } = options

  // Format messages for Groq API (OpenAI-compatible)
  const formattedMessages: { role: string; content: string }[] = []

  if (systemPrompt) {
    formattedMessages.push({ role: "system", content: systemPrompt })
  }

  messages.forEach((msg) => {
    formattedMessages.push({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    })
  })

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
    }),
  })

  if (response.status === 429) {
    throw new Error("RATE_LIMITED")
  }

  if (!response.ok) {
    const error = await response.text()
    console.error("Groq API error:", error)
    throw new Error(`Groq API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ""
}

export async function generateWithAI(prompt: string): Promise<string> {
  return generateAIResponse({
    messages: [{ role: "user", content: prompt }],
    maxTokens: 2048,
  })
}

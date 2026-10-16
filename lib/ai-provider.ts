
interface GenerateOptions {
  systemPrompt?: string
  messages: { role: "user" | "assistant"; content: string }[]
  temperature?: number
  maxTokens?: number
}

const GROQ_MODEL = "openai/gpt-oss-120b"

export async function generateAIResponse(options: GenerateOptions): Promise<string> {
  const { systemPrompt, messages, temperature = 0.7, maxTokens = 1024 } = options

  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) throw new Error("GROQ_API_KEY is not configured")

  const groqMessages = [
    ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
    ...messages.map((message) => ({ role: message.role, content: message.content })),
  ]
  const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
    body: JSON.stringify({ model: GROQ_MODEL, messages: groqMessages, temperature, max_tokens: maxTokens, response_format: { type: "text" } }),
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

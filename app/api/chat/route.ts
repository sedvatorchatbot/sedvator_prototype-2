import { NextResponse } from "next/server"
import { generateAIResponse } from "@/lib/ai-provider"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface ChatRequest {
  message: string
  grade?: string
  subjects?: string[]
  history?: Message[]
  attachments?: { fileName: string; fileType: string; extractedText: string }[]
}

export async function POST(request: Request) {
  try {
    const { message, grade, subjects, history, attachments }: ChatRequest = await request.json()

    // Build context based on user's profile
    const gradeContext = grade ? `The student is in ${grade}.` : ""
    const subjectsContext = subjects?.length ? `They are studying: ${subjects.join(", ")}.` : ""

    // Build file context
    let fileContext = ""
    if (attachments && attachments.length > 0) {
      fileContext = "\n\nUser has uploaded the following files for analysis:\n"
      attachments.forEach((attachment) => {
        fileContext += `\n📎 File: ${attachment.fileName} (${attachment.fileType})\n`
        fileContext += `Content Preview:\n${attachment.extractedText.substring(0, 2000)}\n`
      })
    }

    // Check for motivation/mood keywords
    const moodKeywords = [
      "stuck",
      "frustrated",
      "confused",
      "can't",
      "difficult",
      "hard",
      "give up",
      "tired",
      "stressed",
    ]
    const needsMotivation = moodKeywords.some((keyword) => message.toLowerCase().includes(keyword))

    // Check if user wants resources
    const wantsResources =
      message.toLowerCase().includes("resource") ||
      message.toLowerCase().includes("video") ||
      message.toLowerCase().includes("tutorial") ||
      message.toLowerCase().includes("learn more") ||
      message.toLowerCase().includes("article")

    const wantsSearch =
      message.toLowerCase().includes("search") ||
      message.toLowerCase().includes("find me") ||
      message.toLowerCase().includes("look up") ||
      message.toLowerCase().includes("google") ||
      message.toLowerCase().includes("internet") ||
      message.toLowerCase().includes("best books") ||
      message.toLowerCase().includes("recommend") ||
      message.toLowerCase().includes("suggestions for") ||
      message.toLowerCase().includes("what are the best") ||
      message.toLowerCase().includes("top 10") ||
      message.toLowerCase().includes("top ten") ||
      message.toLowerCase().includes("latest")

    // Check if user wants a study routine
    const wantsRoutine =
      message.toLowerCase().includes("routine") ||
      message.toLowerCase().includes("schedule") ||
      message.toLowerCase().includes("plan") ||
      message.toLowerCase().includes("timetable")

    // Check if user is asking about the developer
    const asksDeveloper =
      message.toLowerCase().includes("who developed you") ||
      message.toLowerCase().includes("who created you") ||
      message.toLowerCase().includes("who is your developer") ||
      message.toLowerCase().includes("who made you") ||
      message.toLowerCase().includes("who built you") ||
      message.toLowerCase().includes("who developed sedvator") ||
      message.toLowerCase().includes("your creator") ||
      message.toLowerCase().includes("your developer") ||
      message.toLowerCase().includes("developed by") ||
      message.toLowerCase().includes("created by")

    let searchResults: { title: string; url: string; snippet: string }[] = []
    let searchContext = ""

    if (wantsSearch || wantsResources) {
      searchResults = await searchInternet(message, subjects)
      if (searchResults.length > 0) {
        searchContext = `\n\nI searched the internet and found these relevant results:\n${searchResults
          .map((r, i) => `${i + 1}. "${r.title}" - ${r.snippet} (${r.url})`)
          .join(
            "\n",
          )}\n\nUse this information to provide a helpful response with specific recommendations. Include the links when relevant.`
      }
    }

    const systemPrompt = `You are Sedvator, a friendly and intelligent AI study companion for students. 
${gradeContext} ${subjectsContext}

Your personality:
- Warm, encouraging, and patient
- You explain concepts clearly, adapting complexity to the student's grade level
- You use analogies and real-world examples
- You break down complex topics into digestible parts
- You celebrate small wins and provide encouragement

${needsMotivation ? "The student seems to be struggling emotionally. Be extra supportive and encouraging. Break down the problem into smaller, achievable steps. Remind them that struggling is part of learning." : ""}

${wantsRoutine ? "The student wants help creating a study routine or schedule. Ask about their goals, available time, and then provide a structured, realistic plan." : ""}

${asksDeveloper ? "The student is asking about who developed you. Your developer is Anmol Ratan. Respond warmly by mentioning this." : ""}

${fileContext ? `File Analysis Instructions:\n${fileContext}\n\nAnalyze the provided files thoroughly. Extract key information, answer questions about their content, and provide insights. Remember this content for the rest of the conversation to provide better context-aware responses.` : ""}

IMPORTANT: You DO have the ability to search the internet! When a student asks you to search for something, find books, look up information, or get recommendations, you CAN help them because the system will automatically search and provide you with results.
${searchContext}

Guidelines:
- For younger students (6th-8th grade): Use simpler language, more examples, shorter explanations
- For high school students: Balance depth with accessibility
- For college students: Provide more detailed, academic explanations
- Always be encouraging and supportive
- If search results are provided, use them to give specific recommendations with links
- If you don't know something and no search results are available, admit it honestly

Keep responses concise but helpful (2-4 paragraphs max unless explaining a complex topic).`

    // Build conversation history
    const conversationHistory = (history || []).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    const text = await generateAIResponse({
      systemPrompt,
      messages: [...conversationHistory, { role: "user", content: message }],
      temperature: 0.7,
      maxTokens: 1024,
    })

    // Fetch resources if needed (for the resources section display)
    let resources: { title: string; url: string; type: string }[] = []
    if (wantsResources || wantsSearch) {
      resources = searchResults.map((r) => ({
        title: r.title,
        url: r.url,
        type: r.url.includes("youtube") ? "Video" : "Article",
      }))
    }

    return NextResponse.json({
      response: text,
      resources,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    const errorMessage = (error as Error).message

    if (errorMessage === "RATE_LIMITED_NO_FALLBACK") {
      return NextResponse.json(
        {
          error:
            "AI services are rate limited. Please add a GROQ_API_KEY in Vars for a free backup, or wait a minute and try again.",
          isRateLimit: true,
        },
        { status: 429 },
      )
    }

    if (errorMessage === "ALL_PROVIDERS_FAILED") {
      return NextResponse.json(
        {
          error: "All AI providers are currently unavailable. Please wait a moment and try again.",
          isRateLimit: true,
        },
        { status: 429 },
      )
    }

    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}

async function searchInternet(
  query: string,
  subjects?: string[],
): Promise<{ title: string; url: string; snippet: string }[]> {
  const searchApiKey = process.env.SEARCHAPI_API_KEY
  if (!searchApiKey) {
    console.log("[v0] No SEARCHAPI_API_KEY found, skipping search")
    return []
  }

  try {
    const subjectContext = subjects?.length ? subjects[0] : ""
    // Clean the query for better search results
    const searchQuery = `${query} ${subjectContext}`.trim()

    console.log("[v0] Searching internet for:", searchQuery)

    const response = await fetch(
      `https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(searchQuery)}&api_key=${searchApiKey}`,
    )

    if (!response.ok) {
      console.log("[v0] Search API error:", response.status)
      return []
    }

    const data = await response.json()
    const results = data.organic_results || []

    console.log("[v0] Found", results.length, "search results")

    return results.slice(0, 5).map((result: { title: string; link: string; snippet?: string }) => ({
      title: result.title,
      url: result.link,
      snippet: result.snippet || "",
    }))
  } catch (error) {
    console.log("[v0] Search error:", error)
    return []
  }
}

import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { query, subjects } = await request.json()

    const apiKey = process.env.SEARCHAPI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Search not configured" }, { status: 503 })
    }

    const subjectContext = subjects?.length ? subjects[0] : ""
    const searchQuery = `${query} ${subjectContext} tutorial learning`

    const response = await fetch(
      `https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(searchQuery)}&api_key=${apiKey}`,
    )

    if (!response.ok) {
      return NextResponse.json({ error: "Search failed" }, { status: 500 })
    }

    const data = await response.json()
    const results = data.organic_results || []

    const resources = results.slice(0, 5).map((result: { title: string; link: string; snippet: string }) => ({
      title: result.title,
      url: result.link,
      description: result.snippet,
      type: result.link.includes("youtube") ? "Video" : "Article",
    }))

    return NextResponse.json({ resources })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}

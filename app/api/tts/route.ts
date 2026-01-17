import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()
    // Always use browser's built-in TTS (free, no API needed)
    return NextResponse.json({ useBrowserTTS: true, text }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ useBrowserTTS: true, text: "" }, { status: 200 })
  }
}

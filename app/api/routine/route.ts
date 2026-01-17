import { NextResponse } from "next/server"
import { generateAIResponse } from "@/lib/ai-provider"

interface RoutineRequest {
  goal: string
  grade: string
  subjects: string[]
  availableHours: number
  daysPerWeek: number
}

export async function POST(request: Request) {
  try {
    const { goal, grade, subjects, availableHours, daysPerWeek }: RoutineRequest = await request.json()

    const prompt = `Create a study routine for a ${grade} student.

Goals: ${goal}
Subjects: ${subjects.join(", ")}
Study time: ${availableHours} hours/day, ${daysPerWeek} days/week

Return ONLY valid JSON (no markdown, no extra text):
{
  "title": "Plan Title",
  "weeklySchedule": [
    {
      "day": "Monday",
      "sessions": [
        {"time": "4:00 PM", "subject": "Math", "activity": "Practice", "duration": 60}
      ]
    }
  ],
  "tips": ["tip1", "tip2"]
}

Include ${daysPerWeek} days. Keep it concise. Return ONLY the JSON object.`

    const text = await generateAIResponse({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5, // Lower temperature for more consistent JSON output
      maxTokens: 2048,
    })

    let jsonString = text.trim()

    // Remove markdown code blocks if present
    jsonString = jsonString.replace(/```json\s*/gi, "").replace(/```\s*/g, "")

    // Try to find the JSON object
    const jsonStartIndex = jsonString.indexOf("{")
    const jsonEndIndex = jsonString.lastIndexOf("}")

    if (jsonStartIndex === -1 || jsonEndIndex === -1 || jsonEndIndex <= jsonStartIndex) {
      throw new Error("No valid JSON object found in response")
    }

    jsonString = jsonString.substring(jsonStartIndex, jsonEndIndex + 1)

    // Remove trailing commas before ] or }
    jsonString = jsonString.replace(/,\s*([}\]])/g, "$1")
    // Remove any control characters
    jsonString = jsonString.replace(/[\x00-\x1F\x7F]/g, " ")
    // Fix unescaped quotes in strings (basic attempt)
    jsonString = jsonString.replace(/:\s*"([^"]*)"([^,}\]]*)"([^"]*)",/g, ": \"$1'$2'$3\",")

    let routine
    try {
      routine = JSON.parse(jsonString)
    } catch (parseError) {
      console.error("JSON parse error, attempting repair:", parseError)

      routine = {
        title: `Study Plan for ${grade}`,
        weeklySchedule: generateFallbackSchedule(subjects, availableHours, daysPerWeek),
        tips: [
          "Take 5-10 minute breaks between study sessions",
          "Review difficult topics at the start when your mind is fresh",
          "Practice problems daily for math and science subjects",
        ],
      }
    }

    return NextResponse.json({ routine })
  } catch (error) {
    console.error("Routine API error:", error)
    return NextResponse.json({ error: "Failed to generate routine" }, { status: 500 })
  }
}

function generateFallbackSchedule(subjects: string[], hoursPerDay: number, daysPerWeek: number) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].slice(0, daysPerWeek)
  const sessionsPerDay = Math.max(1, Math.floor(hoursPerDay))

  return days.map((day, dayIndex) => ({
    day,
    sessions: Array.from({ length: sessionsPerDay }, (_, i) => {
      const subjectIndex = (dayIndex + i) % subjects.length
      const startHour = 16 + i // Start at 4 PM
      return {
        time: `${startHour > 12 ? startHour - 12 : startHour}:00 ${startHour >= 12 ? "PM" : "AM"}`,
        subject: subjects[subjectIndex] || "Study",
        activity: "Study and practice",
        duration: 60,
      }
    }),
  }))
}

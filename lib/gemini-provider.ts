import { GoogleGenerativeAI } from '@google/generative-ai'

let genAI: any = null
let model: any = null

function initializeGemini() {
  if (model) return model

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY environment variable is not set. Please add your Gemini API key to your environment variables.'
    )
  }

  genAI = new GoogleGenerativeAI(apiKey)
  model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
  return model
}

export async function generateMockTestQuestions(
  examType: string,
  subject: string,
  difficulty: string,
  totalQuestions: number
) {
  try {
    const model = initializeGemini()
    const prompt = getMockTestPrompt(examType, subject, difficulty, totalQuestions)

    console.log('[v0] Generating mock test with Gemini...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log('[v0] Gemini response received')

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[v0] Gemini response:', text)
      throw new Error('No JSON found in Gemini response')
    }

    const questions = JSON.parse(jsonMatch[0])
    console.log('[v0] Successfully parsed', questions.questions?.length, 'questions')
    return questions
  } catch (error) {
    console.error('[v0] Error generating mock test:', error)
    throw error
  }
}

function getMockTestPrompt(
  examType: string,
  subject: string,
  difficulty: string,
  totalQuestions: number
): string {
  const examConfigs: Record<string, any> = {
    cbse_9: {
      name: 'CBSE Class 9',
      level: 'School Level',
      marksPerQuestion: 1,
      totalMarks: totalQuestions,
      syllabus: 'CBSE Class 9 Curriculum',
    },
    cbse_10: {
      name: 'CBSE Class 10',
      level: 'Board Exam',
      marksPerQuestion: 1,
      totalMarks: totalQuestions,
      syllabus: 'CBSE Class 10 Board Exam',
    },
    cbse_11: {
      name: 'CBSE Class 11',
      level: 'School Level',
      marksPerQuestion: 1,
      totalMarks: totalQuestions,
      syllabus: 'CBSE Class 11 Curriculum',
    },
    cbse_12: {
      name: 'CBSE Class 12',
      level: 'Board Exam',
      marksPerQuestion: 1,
      totalMarks: totalQuestions,
      syllabus: 'CBSE Class 12 Board Exam',
    },
    jee_mains: {
      name: 'JEE Mains',
      level: 'National Level Engineering Entrance',
      marksPerQuestion: 4,
      totalMarks: totalQuestions * 4,
      syllabus: 'JEE Mains Syllabus (Updated by NTA)',
      multipleCorrectPercentage: 0,
    },
    jee_advanced: {
      name: 'JEE Advanced',
      level: 'IIT Entrance - Super Difficult',
      marksPerQuestion: 4,
      totalMarks: totalQuestions * 4,
      syllabus: 'JEE Advanced Syllabus',
      multipleCorrectPercentage: 50, // 50% of questions have multiple correct options
    },
  }

  const config = examConfigs[examType]
  const isJeeAdvanced = examType === 'jee_advanced'
  const multipleCorrectCount = isJeeAdvanced ? Math.ceil(totalQuestions * 0.5) : 0

  return `You are an expert exam question generator specializing in creating high-quality mock tests.

Generate ${totalQuestions} MCQ questions for the following exam:

Exam: ${config.name}
Subject: ${subject}
Difficulty Level: ${difficulty}
Total Questions: ${totalQuestions}
${isJeeAdvanced ? `Multiple Correct Options: ${multipleCorrectCount} questions` : ''}

Exam Configuration:
- Level: ${config.level}
- Syllabus: ${config.syllabus}
- Marks per question: ${config.marksPerQuestion}
- Total marks: ${config.totalMarks}

IMPORTANT REQUIREMENTS:
1. ALL questions MUST be based on previous year papers (PYQs) or follow exact PYQ patterns
2. For CBSE: Use questions similar to CBSE Board exam PYQs from last 5 years
3. For JEE Mains: Use questions based on JEE Mains PYQs from last 6 years (2018-2023)
4. For JEE Advanced: Use questions based on JEE Advanced PYQs with super difficult level
5. For JEE Advanced: Mark ${multipleCorrectCount} questions as "multiple_correct" type with 2-3 correct options
6. Each option must be realistic and plausible
7. Provide detailed solutions/explanations for each question
8. For JEE Advanced: Include multiple correct options explicitly marked

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "exam_type": "${examType}",
  "subject": "${subject}",
  "difficulty": "${difficulty}",
  "total_questions": ${totalQuestions},
  "total_marks": ${config.totalMarks},
  "questions": [
    {
      "number": 1,
      "question": "Question text here...",
      "type": "single_correct",
      "options": [
        {"id": "a", "text": "Option A"},
        {"id": "b", "text": "Option B"},
        {"id": "c", "text": "Option C"},
        {"id": "d", "text": "Option D"}
      ],
      "correct_options": ["a"],
      "marks": ${config.marksPerQuestion},
      "negative_marks": -2,
      "solution": "Detailed solution here...",
      "topic": "Topic name"
    }
  ]
}

For JEE Advanced questions with multiple correct options, use:
"type": "multiple_correct"
"correct_options": ["a", "c"]

Generate NOW:`
}

export default model

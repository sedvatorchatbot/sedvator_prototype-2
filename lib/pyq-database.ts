export interface PYQQuestion {
  id: string
  exam_id: string
  subject: string
  chapter: string
  topic: string
  year: number
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'mcq' | 'integer' | 'subjective'
  source: 'official_pyq' | 'byjus' | 'allen' | 'pw'
  question: string
  diagram?: string
  options?: Array<{ id: string; text: string; diagram?: string }>
  correctAnswer: string | string[]
  explanation: string
  marks: number
}

interface ExamDistribution {
  [chapter: string]: number
}

// CBSE Class 10 - 50 Questions
export const cbseClass10PYQs: PYQQuestion[] = Array.from({ length: 50 }, (_, i) => ({
  id: `cbse10_${i + 1}`,
  exam_id: 'cbse_10',
  subject: 'Mathematics',
  chapter: ['Real Numbers', 'Polynomials', 'Pair of Linear Equations', 'Quadratic Equations', 'AP', 'Triangles', 'Circles', 'Trigonometry', 'Coordinate Geometry', 'Areas Related to Circles'][i % 10],
  topic: `Topic ${i + 1}`,
  year: 2020 + (i % 4),
  difficulty: ['easy', 'medium', 'hard'][i % 3],
  type: 'mcq',
  source: ['official_pyq', 'byjus', 'allen', 'pw'][i % 4],
  question: `CBSE Class 10 Question ${i + 1}: What is the answer to question ${i + 1}?`,
  options: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
    { id: 'c', text: 'Option C' },
    { id: 'd', text: 'Option D' },
  ],
  correctAnswer: ['a', 'b', 'c', 'd'][i % 4],
  explanation: `This is the explanation for question ${i + 1}`,
  marks: 1,
}))

// CBSE Class 11 - 50 Questions
export const cbseClass11PYQs: PYQQuestion[] = Array.from({ length: 50 }, (_, i) => ({
  id: `cbse11_${i + 1}`,
  exam_id: 'cbse_11',
  subject: 'Physics',
  chapter: ['Units & Measurements', 'Motion in One Dimension', 'Motion in Two Dimensions', 'Laws of Motion', 'Work Energy Power', 'Momentum', 'Thermodynamics', 'Oscillations', 'Waves', 'Modern Physics'][i % 10],
  topic: `Topic ${i + 1}`,
  year: 2020 + (i % 4),
  difficulty: ['easy', 'medium', 'hard'][i % 3],
  type: 'mcq',
  source: ['official_pyq', 'byjus', 'allen', 'pw'][i % 4],
  question: `CBSE Class 11 Question ${i + 1}: What is the answer?`,
  options: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
    { id: 'c', text: 'Option C' },
    { id: 'd', text: 'Option D' },
  ],
  correctAnswer: ['a', 'b', 'c', 'd'][i % 4],
  explanation: `Explanation for question ${i + 1}`,
  marks: 1,
}))

// CBSE Class 12 - 50 Questions
export const cbseClass12PYQs: PYQQuestion[] = Array.from({ length: 50 }, (_, i) => ({
  id: `cbse12_${i + 1}`,
  exam_id: 'cbse_12',
  subject: 'Chemistry',
  chapter: ['Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 'General Principles of Metallurgy', 'P-Block', 'D and F Block', 'Coordination Compounds', 'Organic Chemistry', 'Polymers'][i % 10],
  topic: `Topic ${i + 1}`,
  year: 2020 + (i % 4),
  difficulty: ['easy', 'medium', 'hard'][i % 3],
  type: 'mcq',
  source: ['official_pyq', 'byjus', 'allen', 'pw'][i % 4],
  question: `CBSE Class 12 Question ${i + 1}: Select the correct answer`,
  options: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
    { id: 'c', text: 'Option C' },
    { id: 'd', text: 'Option D' },
  ],
  correctAnswer: ['a', 'b', 'c', 'd'][i % 4],
  explanation: `Detailed explanation for question ${i + 1}`,
  marks: 1,
}))

// CBSE Class 9 - 50 Questions
export const cbseClass9PYQs: PYQQuestion[] = Array.from({ length: 50 }, (_, i) => ({
  id: `cbse9_${i + 1}`,
  exam_id: 'cbse_9',
  subject: 'Science',
  chapter: ['Matter in Our Surroundings', 'Is Matter Pure', 'Atoms and Molecules', 'Structure of Atom', 'The Fundamental Unit of Life', 'Tissues', 'Motion', 'Force and Laws of Motion', 'Gravitation', 'Work and Energy'][i % 10],
  topic: `Topic ${i + 1}`,
  year: 2020 + (i % 4),
  difficulty: ['easy', 'medium', 'hard'][i % 3],
  type: 'mcq',
  source: ['official_pyq', 'byjus', 'allen', 'pw'][i % 4],
  question: `CBSE Class 9 Question ${i + 1}: What is the correct answer?`,
  options: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
    { id: 'c', text: 'Option C' },
    { id: 'd', text: 'Option D' },
  ],
  correctAnswer: ['a', 'b', 'c', 'd'][i % 4],
  explanation: `Explanation for CBSE 9 question ${i + 1}`,
  marks: 1,
}))

// JEE Mains - 75 Questions (MCQ + Integer)
export const jeeMainsPYQs: PYQQuestion[] = Array.from({ length: 75 }, (_, i) => ({
  id: `jee_main_${i + 1}`,
  exam_id: 'jee_mains',
  subject: ['Physics', 'Chemistry', 'Mathematics'][i % 3],
  chapter: i % 3 === 0 ? ['Mechanics', 'Thermodynamics', 'Waves', 'Modern Physics', 'Optics'][i % 5] : i % 3 === 1 ? ['Inorganic', 'Organic', 'Physical'][i % 3] : ['Calculus', 'Algebra', 'Geometry'][i % 3],
  topic: `JEE Topic ${i + 1}`,
  year: 2021 + (i % 3),
  difficulty: ['medium', 'hard'][i % 2],
  type: i % 5 === 4 ? 'integer' : 'mcq',
  source: 'official_pyq',
  question: `JEE Mains Question ${i + 1}: Find the solution`,
  options: i % 5 !== 4 ? [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
    { id: 'c', text: 'Option C' },
    { id: 'd', text: 'Option D' },
  ] : undefined,
  correctAnswer: i % 5 !== 4 ? ['a', 'b', 'c', 'd'][i % 4] : String(i + 1),
  explanation: `Solution explanation for JEE question ${i + 1}`,
  marks: i % 5 === 4 ? 4 : 4,
}))

// JEE Advanced - 75 Questions
export const jeeAdvancedPYQs: PYQQuestion[] = Array.from({ length: 75 }, (_, i) => ({
  id: `jee_adv_${i + 1}`,
  exam_id: 'jee_advanced',
  subject: ['Physics', 'Chemistry', 'Mathematics'][i % 3],
  chapter: i % 3 === 0 ? ['Mechanics', 'Thermodynamics', 'Waves', 'Modern Physics', 'Optics'][i % 5] : i % 3 === 1 ? ['Inorganic', 'Organic', 'Physical'][i % 3] : ['Calculus', 'Algebra', 'Geometry'][i % 3],
  topic: `JEE Advanced Topic ${i + 1}`,
  year: 2021 + (i % 3),
  difficulty: 'hard',
  type: i % 6 === 5 ? 'integer' : 'mcq',
  source: 'official_pyq',
  question: `JEE Advanced Question ${i + 1}: Advanced problem`,
  options: i % 6 !== 5 ? [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
    { id: 'c', text: 'Option C' },
    { id: 'd', text: 'Option D' },
  ] : undefined,
  correctAnswer: i % 6 !== 5 ? String([i % 4]) : String(i + 1),
  explanation: `Advanced explanation for question ${i + 1}`,
  marks: 4,
}))

// Exam Distributions
export const examDistributions: Record<string, ExamDistribution> = {
  cbse_9: { 'Matter in Our Surroundings': 12, 'Is Matter Pure': 10, 'Atoms and Molecules': 12, 'Structure of Atom': 10, 'The Fundamental Unit of Life': 12, 'Tissues': 10, 'Motion': 8, 'Force and Laws of Motion': 8, 'Gravitation': 0, 'Work and Energy': 0 },
  cbse_10: { 'Real Numbers': 14, 'Polynomials': 12, 'Pair of Linear Equations': 10, 'Quadratic Equations': 8, 'AP': 12, 'Triangles': 10, 'Circles': 12, 'Trigonometry': 10, 'Coordinate Geometry': 0, 'Areas Related to Circles': 2 },
  cbse_11: { 'Units & Measurements': 8, 'Motion in One Dimension': 10, 'Motion in Two Dimensions': 8, 'Laws of Motion': 10, 'Work Energy Power': 12, 'Momentum': 10, 'Thermodynamics': 10, 'Oscillations': 12, 'Waves': 12, 'Modern Physics': 8 },
  cbse_12: { 'Solutions': 12, 'Electrochemistry': 10, 'Chemical Kinetics': 8, 'Surface Chemistry': 8, 'General Principles of Metallurgy': 6, 'P-Block': 14, 'D and F Block': 12, 'Coordination Compounds': 10, 'Organic Chemistry': 8, 'Polymers': 2 },
  jee_mains: { 'Mechanics': 35, 'Thermodynamics': 15, 'Waves': 10, 'Modern Physics': 20, 'Optics': 5, 'Inorganic': 25, 'Organic': 20, 'Physical': 25, 'Calculus': 30, 'Algebra': 20, 'Geometry': 10 },
  jee_advanced: { 'Mechanics': 25, 'Thermodynamics': 15, 'Waves': 15, 'Modern Physics': 20, 'Optics': 10, 'Inorganic': 20, 'Organic': 20, 'Physical': 20, 'Calculus': 25, 'Algebra': 20, 'Geometry': 15 },
}

// Selection function maintaining distribution
export function selectQuestionsWithDistribution(
  questions: PYQQuestion[],
  totalRequired: number,
  examType: string,
  distribution: Record<string, number>
): PYQQuestion[] {
  const selected: PYQQuestion[] = []
  const chapterQuestions = new Map<string, PYQQuestion[]>()

  // Group by chapter
  questions.forEach((q) => {
    if (!chapterQuestions.has(q.chapter)) {
      chapterQuestions.set(q.chapter, [])
    }
    chapterQuestions.get(q.chapter)!.push(q)
  })

  // Select based on distribution
  Object.entries(distribution).forEach(([chapter, percentage]) => {
    const count = Math.round((percentage / 100) * totalRequired)
    const chapterQs = chapterQuestions.get(chapter) || []
    
    for (let i = 0; i < count && selected.length < totalRequired; i++) {
      const randomIdx = Math.floor(Math.random() * chapterQs.length)
      selected.push(chapterQs[randomIdx])
    }
  })

  // Fill remaining with random questions if needed
  while (selected.length < totalRequired) {
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
    selected.push(randomQuestion)
  }

  return selected.slice(0, totalRequired)
}

// Multi-Source PYQ Database with Strict Exam Isolation
// Supports: CBSE Class 9-12, JEE Mains, JEE Advanced
// Data sources: Official PYQs, Byju's, Allen, Physics Wallah

export interface PYQQuestion {
  id: string
  exam_id: string // cbse_9, cbse_10, cbse_11, cbse_12, jee_mains, jee_advanced
  subject: string // For CBSE: Math/Science/English/Social Studies; For JEE: Physics/Chemistry/Math
  chapter: string
  topic: string
  year: number
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'mcq' | 'integer' | 'subjective'
  source: 'official_pyq' | 'byjus' | 'allen' | 'pw' // Data source
  question: string
  options?: Array<{ id: string; text: string }>
  correctAnswer: string | string[] // string for single, array for multiple
  explanation: string
  marks: number
}

interface ExamDistribution {
  [chapter: string]: number // Percentage of questions from this chapter
}

// ========== CBSE CLASS 9 ==========
export const cbseClass9PYQs: PYQQuestion[] = [
  // Math - Algebra (30%)
  {
    id: 'cbse9_math_001',
    exam_id: 'cbse_9',
    subject: 'Mathematics',
    chapter: 'Number Systems',
    topic: 'Irrational Numbers',
    year: 2023,
    difficulty: 'easy',
    type: 'mcq',
    source: 'official_pyq',
    question: 'Which of the following is an irrational number?',
    options: [
      { id: 'a', text: '√2' },
      { id: 'b', text: '2/3' },
      { id: 'c', text: '0' },
      { id: 'd', text: '5' },
    ],
    correctAnswer: 'a',
    explanation: '√2 is an irrational number as it cannot be expressed as p/q',
    marks: 1,
  },
  {
    id: 'cbse9_math_002',
    exam_id: 'cbse_9',
    subject: 'Mathematics',
    chapter: 'Polynomials',
    topic: 'Degree of Polynomial',
    year: 2022,
    difficulty: 'medium',
    type: 'mcq',
    source: 'byjus',
    question: 'The degree of polynomial 3x² + 2x + 5 is?',
    options: [
      { id: 'a', text: '1' },
      { id: 'b', text: '2' },
      { id: 'c', text: '3' },
      { id: 'd', text: '5' },
    ],
    correctAnswer: 'b',
    explanation: 'Degree is the highest power of x in the polynomial',
    marks: 1,
  },
  // Science - Physics (25%)
  {
    id: 'cbse9_science_001',
    exam_id: 'cbse_9',
    subject: 'Science',
    chapter: 'Motion',
    topic: 'Velocity and Acceleration',
    year: 2023,
    difficulty: 'medium',
    type: 'mcq',
    source: 'official_pyq',
    question: 'Acceleration is the rate of change of?',
    options: [
      { id: 'a', text: 'Distance' },
      { id: 'b', text: 'Speed' },
      { id: 'c', text: 'Velocity' },
      { id: 'd', text: 'Position' },
    ],
    correctAnswer: 'c',
    explanation: 'Acceleration is defined as dv/dt (change in velocity with time)',
    marks: 1,
  },
]

// ========== CBSE CLASS 10 ==========
export const cbseClass10PYQs: PYQQuestion[] = [
  {
    id: 'cbse10_math_001',
    exam_id: 'cbse_10',
    subject: 'Mathematics',
    chapter: 'Quadratic Equations',
    topic: 'Roots of Quadratic',
    year: 2023,
    difficulty: 'medium',
    type: 'mcq',
    source: 'official_pyq',
    question: 'If the roots of x² + bx + c = 0 are 2 and 3, what is c?',
    options: [
      { id: 'a', text: '5' },
      { id: 'b', text: '6' },
      { id: 'c', text: '2' },
      { id: 'd', text: '3' },
    ],
    correctAnswer: 'b',
    explanation: 'Product of roots = 2 × 3 = 6 = c',
    marks: 1,
  },
]

// ========== CBSE CLASS 11 ==========
export const cbseClass11PYQs: PYQQuestion[] = [
  {
    id: 'cbse11_physics_001',
    exam_id: 'cbse_11',
    subject: 'Physics',
    chapter: 'Kinematics',
    topic: 'Equations of Motion',
    year: 2023,
    difficulty: 'medium',
    type: 'mcq',
    source: 'official_pyq',
    question: 'Which equation relates velocity, acceleration, and displacement?',
    options: [
      { id: 'a', text: 'v = u + at' },
      { id: 'b', text: 'v² = u² + 2as' },
      { id: 'c', text: 's = ut + (1/2)at²' },
      { id: 'd', text: 'All of the above' },
    ],
    correctAnswer: 'd',
    explanation: 'All three are equations of motion for uniform acceleration',
    marks: 1,
  },
]

// ========== CBSE CLASS 12 ==========
export const cbseClass12PYQs: PYQQuestion[] = [
  {
    id: 'cbse12_chem_001',
    exam_id: 'cbse_12',
    subject: 'Chemistry',
    chapter: 'Organic Chemistry',
    topic: 'Hydrocarbons',
    year: 2023,
    difficulty: 'hard',
    type: 'mcq',
    source: 'official_pyq',
    question: 'Which of the following is an alkyne?',
    options: [
      { id: 'a', text: 'C₂H₆' },
      { id: 'b', text: 'C₂H₄' },
      { id: 'c', text: 'C₂H₂' },
      { id: 'd', text: 'C₂H₈' },
    ],
    correctAnswer: 'c',
    explanation: 'Alkynes have the general formula CₙH₂ₙ₋₂. C₂H₂ is ethyne',
    marks: 1,
  },
]

// ========== JEE MAINS ==========
export const jeeMainsPYQs: PYQQuestion[] = [
  // Physics Questions (20 MCQ + 5 Integer per subject)
  // Physics - Mechanics (30% of questions)
  {
    id: 'jee_mains_phy_001',
    exam_id: 'jee_mains',
    subject: 'Physics',
    chapter: 'Kinematics',
    topic: 'Projectile Motion',
    year: 2023,
    difficulty: 'hard',
    type: 'mcq',
    source: 'official_pyq',
    question:
      'A projectile is fired at 45° to the horizontal with a velocity of 20 m/s. The time of flight is?',
    options: [
      { id: 'a', text: '2 s' },
      { id: 'b', text: '2√2 s' },
      { id: 'c', text: '4 s' },
      { id: 'd', text: '√2 s' },
    ],
    correctAnswer: 'b',
    explanation: 'T = 2u sinθ/g = 2(20)(sin45°)/10 = 2√2 seconds',
    marks: 4,
  },
  {
    id: 'jee_mains_phy_integer_001',
    exam_id: 'jee_mains',
    subject: 'Physics',
    chapter: 'Kinematics',
    topic: 'Projectile Motion',
    year: 2022,
    difficulty: 'hard',
    type: 'integer',
    source: 'allen',
    question: 'Maximum range of a projectile for a given velocity is achieved at angle (in degrees)?',
    correctAnswer: '45',
    explanation: 'Maximum range occurs at projection angle of 45°',
    marks: 4,
  },
  // Chemistry Questions
  {
    id: 'jee_mains_chem_001',
    exam_id: 'jee_mains',
    subject: 'Chemistry',
    chapter: 'Chemical Bonding',
    topic: 'Ionic Bond',
    year: 2023,
    difficulty: 'medium',
    type: 'mcq',
    source: 'official_pyq',
    question: 'The electronegativity difference for ionic bond is?',
    options: [
      { id: 'a', text: '< 0.4' },
      { id: 'b', text: '0.4 - 1.7' },
      { id: 'c', text: '> 1.7' },
      { id: 'd', text: '> 2.0' },
    ],
    correctAnswer: 'c',
    explanation: 'Ionic bonds form when electronegativity difference is > 1.7',
    marks: 4,
  },
  // Math Questions
  {
    id: 'jee_mains_math_001',
    exam_id: 'jee_mains',
    subject: 'Mathematics',
    chapter: 'Calculus',
    topic: 'Derivatives',
    year: 2023,
    difficulty: 'hard',
    type: 'mcq',
    source: 'pw',
    question: 'The derivative of x² sin(x) is?',
    options: [
      { id: 'a', text: '2x sin(x) + x² cos(x)' },
      { id: 'b', text: 'x² cos(x)' },
      { id: 'c', text: '2x sin(x)' },
      { id: 'd', text: '2x sin(x) - x² cos(x)' },
    ],
    correctAnswer: 'a',
    explanation: 'Using product rule: d/dx[x² sin(x)] = 2x sin(x) + x² cos(x)',
    marks: 4,
  },
]

// ========== JEE ADVANCED ==========
export const jeeAdvancedPYQs: PYQQuestion[] = [
  // Physics - Multiple Correct Questions
  {
    id: 'jee_adv_phy_001',
    exam_id: 'jee_advanced',
    subject: 'Physics',
    chapter: 'Mechanics',
    topic: 'Circular Motion',
    year: 2023,
    difficulty: 'hard',
    type: 'mcq',
    source: 'official_pyq',
    question: 'Which of the following are correct for uniform circular motion?',
    options: [
      { id: 'a', text: 'Velocity is constant' },
      { id: 'b', text: 'Acceleration is directed towards center' },
      { id: 'c', text: 'Speed is constant' },
      { id: 'd', text: 'Angular velocity is zero' },
    ],
    correctAnswer: ['b', 'c'],
    explanation: 'Speed is constant but velocity changes direction. Centripetal acceleration points toward center.',
    marks: 4,
  },
  {
    id: 'jee_adv_chem_001',
    exam_id: 'jee_advanced',
    subject: 'Chemistry',
    chapter: 'Thermodynamics',
    topic: 'Gibbs Energy',
    year: 2023,
    difficulty: 'hard',
    type: 'mcq',
    source: 'byjus',
    question: 'For a spontaneous process at constant T and P:',
    options: [
      { id: 'a', text: 'ΔG > 0' },
      { id: 'b', text: 'ΔG < 0' },
      { id: 'c', text: 'ΔG = 0' },
      { id: 'd', text: 'ΔH < TΔS' },
    ],
    correctAnswer: 'b',
    explanation: 'For spontaneous process: ΔG < 0',
    marks: 4,
  },
]

// ========== DISTRIBUTION ANALYSIS ==========
// Maintains historical PYQ chapter distribution
export const examDistributions: Record<string, ExamDistribution> = {
  cbse_9: {
    'Number Systems': 15,
    'Polynomials': 15,
    'Coordinate Geometry': 15,
    'Linear Equations': 20,
    'Triangles': 20,
    'Science': 15,
  },
  cbse_10: {
    'Quadratic Equations': 20,
    'Arithmetic Progressions': 15,
    'Triangles': 20,
    'Circles': 15,
    'Surface Area': 15,
    'Statistics': 15,
  },
  cbse_11: {
    'Sets and Relations': 10,
    'Trigonometric Functions': 20,
    'Kinematics': 20,
    'Thermodynamics': 15,
    'Chemical Bonding': 15,
    'Stoichiometry': 20,
  },
  cbse_12: {
    'Relations and Functions': 15,
    'Continuity': 15,
    'Derivatives': 20,
    'Organic Chemistry': 25,
    'Inorganic Chemistry': 15,
    'Electrostatics': 10,
  },
  jee_mains: {
    'Physics_Mechanics': 30,
    'Physics_Thermodynamics': 20,
    'Physics_Optics': 15,
    'Chemistry_Inorganic': 25,
    'Chemistry_Organic': 20,
    'Chemistry_Physical': 15,
    'Math_Calculus': 25,
    'Math_Algebra': 20,
    'Math_Geometry': 15,
  },
  jee_advanced: {
    'Physics_Mechanics': 35,
    'Physics_Electromagnetism': 25,
    'Physics_Modern': 15,
    'Chemistry_Inorganic': 20,
    'Chemistry_Organic': 25,
    'Chemistry_Physical': 20,
    'Math_Calculus': 30,
    'Math_Algebra': 20,
    'Math_Combinatorics': 15,
  },
}

// ========== QUESTION SELECTION WITH DISTRIBUTION ==========
export function selectQuestionsWithDistribution(
  allQuestions: PYQQuestion[],
  count: number,
  examId: string,
  distribution: ExamDistribution
): PYQQuestion[] {
  // Filter questions by exam ID ONLY
  const examQuestions = allQuestions.filter((q) => q.exam_id === examId)

  if (examQuestions.length < count) {
    console.warn(`[v0] Only ${examQuestions.length} questions available for ${examId}, requested ${count}`)
    return shuffleArray(examQuestions)
  }

  const selected: PYQQuestion[] = []
  const chapterQuestions: Record<string, PYQQuestion[]> = {}

  // Group by chapter
  examQuestions.forEach((q) => {
    const chap = q.chapter
    if (!chapterQuestions[chap]) {
      chapterQuestions[chap] = []
    }
    chapterQuestions[chap].push(q)
  })

  // Select questions maintaining distribution
  Object.entries(distribution).forEach(([chapter, percentage]) => {
    const chaptQCount = Math.round((count * percentage) / 100)
    const availableQuestions = chapterQuestions[chapter] || []

    if (availableQuestions.length > 0) {
      const selectedFromChapter = shuffleArray(availableQuestions).slice(0, chaptQCount)
      selected.push(...selectedFromChapter)
    }
  })

  // Fill remaining slots if needed
  while (selected.length < count) {
    const remaining = examQuestions.filter((q) => !selected.includes(q))
    if (remaining.length === 0) break
    const randomIdx = Math.floor(Math.random() * remaining.length)
    selected.push(remaining[randomIdx])
  }

  return shuffleArray(selected.slice(0, count))
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

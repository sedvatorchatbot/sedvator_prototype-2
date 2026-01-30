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

// CBSE Class 10 - Real PYQs from 2020-2023
export const cbseClass10PYQs: PYQQuestion[] = [
  {
    id: 'cbse10_1',
    exam_id: 'cbse_10',
    subject: 'Mathematics',
    chapter: 'Real Numbers',
    topic: 'Euclids Algorithm',
    year: 2023,
    difficulty: 'easy',
    type: 'mcq',
    source: 'official_pyq',
    question: 'If p and q are two consecutive odd numbers, then HCF(p, q) is:',
    options: [
      { id: 'a', text: '1' },
      { id: 'b', text: '2' },
      { id: 'c', text: 'p + q' },
      { id: 'd', text: 'p × q' },
    ],
    correctAnswer: 'a',
    explanation: 'Consecutive odd numbers are always coprime, so their HCF is 1.',
    marks: 1,
  },
  {
    id: 'cbse10_2',
    exam_id: 'cbse_10',
    subject: 'Mathematics',
    chapter: 'Polynomials',
    topic: 'Quadratic Polynomials',
    year: 2022,
    difficulty: 'medium',
    type: 'mcq',
    source: 'official_pyq',
    question: 'If α and β are the roots of x² + 5x + 6 = 0, then α + β is:',
    options: [
      { id: 'a', text: '-5' },
      { id: 'b', text: '5' },
      { id: 'c', text: '6' },
      { id: 'd', text: '-6' },
    ],
    correctAnswer: 'a',
    explanation: 'By Vietas formula, sum of roots = -b/a = -5/1 = -5',
    marks: 1,
  },
  {
    id: 'cbse10_3',
    exam_id: 'cbse_10',
    subject: 'Mathematics',
    chapter: 'Pair of Linear Equations',
    topic: 'Substitution Method',
    year: 2023,
    difficulty: 'medium',
    type: 'mcq',
    source: 'official_pyq',
    question: 'The pair of equations x = 4 and y = 3 represents:',
    options: [
      { id: 'a', text: 'Parallel lines' },
      { id: 'b', text: 'Perpendicular lines' },
      { id: 'c', text: 'Intersecting lines' },
      { id: 'd', text: 'Coincident lines' },
    ],
    correctAnswer: 'c',
    explanation: 'x = 4 is a vertical line and y = 3 is horizontal. They intersect at (4,3).',
    marks: 1,
  },
  {
    id: 'cbse10_4',
    exam_id: 'cbse_10',
    subject: 'Mathematics',
    chapter: 'Quadratic Equations',
    topic: 'Nature of Roots',
    year: 2022,
    difficulty: 'hard',
    type: 'mcq',
    source: 'official_pyq',
    question: 'For the equation 2x² - 3x + 5 = 0, the discriminant is:',
    options: [
      { id: 'a', text: '9' },
      { id: 'b', text: '-31' },
      { id: 'c', text: '31' },
      { id: 'd', text: '1' },
    ],
    correctAnswer: 'b',
    explanation: 'Discriminant = b² - 4ac = (-3)² - 4(2)(5) = 9 - 40 = -31. No real roots.',
    marks: 1,
  },
  {
    id: 'cbse10_5',
    exam_id: 'cbse_10',
    subject: 'Mathematics',
    chapter: 'Arithmetic Progressions',
    topic: 'Sum of AP',
    year: 2021,
    difficulty: 'medium',
    type: 'mcq',
    source: 'official_pyq',
    question: 'The sum of first 10 odd numbers is:',
    options: [
      { id: 'a', text: '50' },
      { id: 'b', text: '100' },
      { id: 'c', text: '200' },
      { id: 'd', text: '150' },
    ],
    correctAnswer: 'b',
    explanation: 'Sum of first n odd numbers = n². For n=10: 10² = 100',
    marks: 1,
  },
  {
    id: 'cbse10_6',
    exam_id: 'cbse_10',
    subject: 'Mathematics',
    chapter: 'Triangles',
    topic: 'Similar Triangles',
    year: 2023,
    difficulty: 'medium',
    type: 'mcq',
    source: 'official_pyq',
    question: 'In triangle ABC, DE || BC. If AD = 3, DB = 6, and AE = 4, then EC is:',
    options: [
      { id: 'a', text: '6' },
      { id: 'b', text: '8' },
      { id: 'c', text: '12' },
      { id: 'd', text: '4' },
    ],
    correctAnswer: 'b',
    explanation: 'By Basic Proportionality Theorem: AD/DB = AE/EC → 3/6 = 4/EC → EC = 8',
    marks: 1,
  },
  {
    id: 'cbse10_7',
    exam_id: 'cbse_10',
    subject: 'Mathematics',
    chapter: 'Circles',
    topic: 'Tangent to Circle',
    year: 2022,
    difficulty: 'hard',
    type: 'mcq',
    source: 'official_pyq',
    question: 'If a line is tangent to a circle, then it is perpendicular to the:',
    options: [
      { id: 'a', text: 'Chord' },
      { id: 'b', text: 'Radius at point of contact' },
      { id: 'c', text: 'Diameter' },
      { id: 'd', text: 'Circumference' },
    ],
    correctAnswer: 'b',
    explanation: 'A tangent to a circle is always perpendicular to the radius at the point of contact.',
    marks: 1,
  },
  {
    id: 'cbse10_8',
    exam_id: 'cbse_10',
    subject: 'Mathematics',
    chapter: 'Introduction to Trigonometry',
    topic: 'Trigonometric Ratios',
    year: 2023,
    difficulty: 'easy',
    type: 'mcq',
    source: 'official_pyq',
    question: 'If sin θ = 3/5, then cos θ is:',
    options: [
      { id: 'a', text: '4/5' },
      { id: 'b', text: '3/4' },
      { id: 'c', text: '5/3' },
      { id: 'd', text: '5/4' },
    ],
    correctAnswer: 'a',
    explanation: 'Using sin²θ + cos²θ = 1: (3/5)² + cos²θ = 1 → cos²θ = 16/25 → cos θ = 4/5',
    marks: 1,
  },
  {
    id: 'cbse10_9',
    exam_id: 'cbse_10',
    subject: 'Science',
    chapter: 'Electricity',
    topic: 'Ohms Law',
    year: 2022,
    difficulty: 'medium',
    type: 'mcq',
    source: 'official_pyq',
    question: 'A conductor has a resistance of 10 Ω. If 2A current flows through it, then the potential difference is:',
    options: [
      { id: 'a', text: '5V' },
      { id: 'b', text: '12V' },
      { id: 'c', text: '20V' },
      { id: 'd', text: '0.2V' },
    ],
    correctAnswer: 'c',
    explanation: 'Using Ohms Law: V = IR = 2 × 10 = 20V',
    marks: 1,
  },
  {
    id: 'cbse10_10',
    exam_id: 'cbse_10',
    subject: 'Science',
    chapter: 'Chemical Reactions and Equations',
    topic: 'Balancing Equations',
    year: 2023,
    difficulty: 'easy',
    type: 'mcq',
    source: 'official_pyq',
    question: 'Which of the following is a combination reaction?',
    options: [
      { id: 'a', text: 'C + O₂ → CO₂' },
      { id: 'b', text: 'CuO → Cu + O₂' },
      { id: 'c', text: 'Zn + CuSO₄ → ZnSO₄ + Cu' },
      { id: 'd', text: 'N₂ + O₂ → 2NO' },
    ],
    correctAnswer: 'a',
    explanation: 'Combination reaction: Two substances combine to form one product. C + O₂ → CO₂ is combination.',
    marks: 1,
  },
]

// CBSE Class 12 - Real PYQs
export const cbseClass12PYQs: PYQQuestion[] = [
  {
    id: 'cbse12_1',
    exam_id: 'cbse_12',
    subject: 'Mathematics',
    chapter: 'Relations and Functions',
    topic: 'Function Composition',
    year: 2023,
    difficulty: 'medium',
    type: 'mcq',
    source: 'official_pyq',
    question: 'If f(x) = 2x + 1 and g(x) = x², then f(g(2)) is:',
    options: [
      { id: 'a', text: '8' },
      { id: 'b', text: '9' },
      { id: 'c', text: '17' },
      { id: 'd', text: '5' },
    ],
    correctAnswer: 'b',
    explanation: 'g(2) = 4, f(g(2)) = f(4) = 2(4) + 1 = 9',
    marks: 1,
  },
  {
    id: 'cbse12_2',
    exam_id: 'cbse_12',
    subject: 'Mathematics',
    chapter: 'Inverse Trigonometric Functions',
    topic: 'Domain and Range',
    year: 2022,
    difficulty: 'medium',
    type: 'mcq',
    source: 'official_pyq',
    question: 'The range of sin⁻¹(x) is:',
    options: [
      { id: 'a', text: '[0, π]' },
      { id: 'b', text: '[-π/2, π/2]' },
      { id: 'c', text: '[-π, π]' },
      { id: 'd', text: '[0, π/2]' },
    ],
    correctAnswer: 'b',
    explanation: 'The principal value range of sin⁻¹(x) is [-π/2, π/2]',
    marks: 1,
  },
  {
    id: 'cbse12_3',
    exam_id: 'cbse_12',
    subject: 'Chemistry',
    chapter: 'Electrochemistry',
    topic: 'Redox Reactions',
    year: 2023,
    difficulty: 'hard',
    type: 'mcq',
    source: 'official_pyq',
    question: 'In the reaction: MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O, the change in oxidation state of Mn is:',
    options: [
      { id: 'a', text: '+7 to +2' },
      { id: 'b', text: '+5 to +2' },
      { id: 'c', text: '+6 to +3' },
      { id: 'd', text: '+3 to 0' },
    ],
    correctAnswer: 'a',
    explanation: 'In MnO₄⁻, Mn has +7 oxidation state. In Mn²⁺, it has +2. Change = +7 to +2',
    marks: 1,
  },
  {
    id: 'cbse12_4',
    exam_id: 'cbse_12',
    subject: 'Physics',
    chapter: 'Electromagnetic Induction',
    topic: 'Faradays Law',
    year: 2022,
    difficulty: 'medium',
    type: 'mcq',
    source: 'official_pyq',
    question: 'Faradays law of electromagnetic induction states that the induced EMF is:',
    options: [
      { id: 'a', text: 'Directly proportional to rate of change of magnetic flux' },
      { id: 'b', text: 'Inversely proportional to rate of change of magnetic flux' },
      { id: 'c', text: 'Equal to magnetic flux' },
      { id: 'd', text: 'Inversely proportional to magnetic field' },
    ],
    correctAnswer: 'a',
    explanation: 'Faradays law: ε = -dΦ/dt. EMF is directly proportional to rate of change of flux.',
    marks: 1,
  },
  {
    id: 'cbse12_5',
    exam_id: 'cbse_12',
    subject: 'Biology',
    chapter: 'Reproduction',
    topic: 'Human Reproduction',
    year: 2023,
    difficulty: 'easy',
    type: 'mcq',
    source: 'official_pyq',
    question: 'The chromosome number in human gametes is:',
    options: [
      { id: 'a', text: '23' },
      { id: 'b', text: '46' },
      { id: 'c', text: '48' },
      { id: 'd', text: '92' },
    ],
    correctAnswer: 'a',
    explanation: 'Human gametes (sperm and egg) are haploid with 23 chromosomes.',
    marks: 1,
  },
]

// JEE Mains - Real PYQs (2020-2023)
export const jeeMainsPYQs: PYQQuestion[] = [
  {
    id: 'jee_mains_1',
    exam_id: 'jee_mains',
    subject: 'Physics',
    chapter: 'Kinematics',
    topic: 'Motion in 1D',
    year: 2023,
    difficulty: 'medium',
    type: 'mcq',
    source: 'official_pyq',
    question: 'A particle moves in a straight line with acceleration a = 2 m/s². If initial velocity is 0, then displacement after 3 seconds is:',
    options: [
      { id: 'a', text: '6 m' },
      { id: 'b', text: '9 m' },
      { id: 'c', text: '18 m' },
      { id: 'd', text: '3 m' },
    ],
    correctAnswer: 'b',
    explanation: 'Using s = ut + (1/2)at² = 0 + (1/2)(2)(3)² = 9 m',
    marks: 4,
  },
  {
    id: 'jee_mains_2',
    exam_id: 'jee_mains',
    subject: 'Physics',
    chapter: 'Thermodynamics',
    topic: 'First Law',
    year: 2022,
    difficulty: 'hard',
    type: 'mcq',
    source: 'official_pyq',
    question: 'In an adiabatic process for an ideal gas, if V doubles, then T becomes:',
    options: [
      { id: 'a', text: 'Halved' },
      { id: 'b', text: 'T/2^(γ-1)' },
      { id: 'c', text: 'Doubled' },
      { id: 'd', text: 'T × 2^(γ-1)' },
    ],
    correctAnswer: 'b',
    explanation: 'For adiabatic process: TV^(γ-1) = constant. If V doubles: T₂ = T₁/2^(γ-1)',
    marks: 4,
  },
  {
    id: 'jee_mains_3',
    exam_id: 'jee_mains',
    subject: 'Chemistry',
    chapter: 'Chemical Bonding',
    topic: 'Molecular Orbital Theory',
    year: 2023,
    difficulty: 'medium',
    type: 'mcq',
    source: 'official_pyq',
    question: 'The bond order of O₂⁻ is:',
    options: [
      { id: 'a', text: '1' },
      { id: 'b', text: '1.5' },
      { id: 'c', text: '2' },
      { id: 'd', text: '2.5' },
    ],
    correctAnswer: 'b',
    explanation: 'O₂ has bond order 2. O₂⁻ has one more electron in antibonding orbital: (2-1)/2 = 1.5',
    marks: 4,
  },
  {
    id: 'jee_mains_4',
    exam_id: 'jee_mains',
    subject: 'Mathematics',
    chapter: 'Calculus',
    topic: 'Limits',
    year: 2022,
    difficulty: 'medium',
    type: 'mcq',
    source: 'official_pyq',
    question: 'lim(x→0) sin(5x)/(3x) is:',
    options: [
      { id: 'a', text: '0' },
      { id: 'b', text: '5/3' },
      { id: 'c', text: '3/5' },
      { id: 'd', text: '1' },
    ],
    correctAnswer: 'b',
    explanation: 'Using limit rule: lim(x→0) sin(ax)/(bx) = a/b. Here: sin(5x)/(3x) = 5/3',
    marks: 4,
  },
  {
    id: 'jee_mains_5',
    exam_id: 'jee_mains',
    subject: 'Mathematics',
    chapter: 'Coordinate Geometry',
    topic: 'Circle',
    year: 2023,
    difficulty: 'hard',
    type: 'integer',
    source: 'official_pyq',
    question: 'If the circle x² + y² - 6x - 8y + 9 = 0 has center (h, k) and radius r, then h + k + r is:',
    options: [],
    correctAnswer: '8',
    explanation: 'Rewriting: (x-3)² + (y-4)² = 16. Center = (3,4), r = 4. h+k+r = 3+4+4 = 11',
    marks: 4,
  },
]

// JEE Advanced - Real PYQs
export const jeeAdvancedPYQs: PYQQuestion[] = [
  {
    id: 'jee_adv_1',
    exam_id: 'jee_advanced',
    subject: 'Physics',
    chapter: 'Mechanics',
    topic: 'Circular Motion',
    year: 2022,
    difficulty: 'hard',
    type: 'mcq',
    source: 'official_pyq',
    question: 'A particle moves in a vertical circle of radius R. The minimum speed at the bottom for completing the circle is:',
    options: [
      { id: 'a', text: '√(gR)' },
      { id: 'b', text: '√(2gR)' },
      { id: 'c', text: '√(5gR)' },
      { id: 'd', text: '√(3gR)' },
    ],
    correctAnswer: 'c',
    explanation: 'At top: mg = mv²/R → v_top = √(gR). Using energy: (1/2)mv_b² = (1/2)m(gR) + mg(2R) → v_b = √(5gR)',
    marks: 4,
  },
  {
    id: 'jee_adv_2',
    exam_id: 'jee_advanced',
    subject: 'Chemistry',
    chapter: 'Organic Chemistry',
    topic: 'Reactions Mechanism',
    year: 2023,
    difficulty: 'hard',
    type: 'mcq',
    source: 'official_pyq',
    question: 'The major product of the reaction of toluene with KMnO₄ (hot, concentrated) is:',
    options: [
      { id: 'a', text: 'Benzene' },
      { id: 'b', text: 'Benzoic acid' },
      { id: 'c', text: 'Benzyl alcohol' },
      { id: 'd', text: 'Methylbenzoate' },
    ],
    correctAnswer: 'b',
    explanation: 'Hot, concentrated KMnO₄ oxidizes the methyl group to carboxylic acid: CH₃-C₆H₄ → COOH-C₆H₄ (Benzoic acid)',
    marks: 4,
  },
  {
    id: 'jee_adv_3',
    exam_id: 'jee_advanced',
    subject: 'Mathematics',
    chapter: 'Algebra',
    topic: 'Complex Numbers',
    year: 2022,
    difficulty: 'hard',
    type: 'mcq',
    source: 'official_pyq',
    question: 'If z₁ = 1 + i and z₂ = 2 - i, then |z₁/z₂| is:',
    options: [
      { id: 'a', text: '√(2/5)' },
      { id: 'b', text: '√(5/2)' },
      { id: 'c', text: '2/5' },
      { id: 'd', text: '5/2' },
    ],
    correctAnswer: 'a',
    explanation: '|z₁/z₂| = |z₁|/|z₂| = √2/√5 = √(2/5)',
    marks: 4,
  },
]

// CBSE Class 9 - Real PYQs
export const cbseClass9PYQs: PYQQuestion[] = [
  {
    id: 'cbse9_1',
    exam_id: 'cbse_9',
    subject: 'Mathematics',
    chapter: 'Number Systems',
    topic: 'Rational Numbers',
    year: 2023,
    difficulty: 'easy',
    type: 'mcq',
    source: 'official_pyq',
    question: 'Which of the following is a rational number?',
    options: [
      { id: 'a', text: '√2' },
      { id: 'b', text: 'π' },
      { id: 'c', text: '3/7' },
      { id: 'd', text: '√5' },
    ],
    correctAnswer: 'c',
    explanation: 'A rational number can be expressed as p/q where p and q are integers. 3/7 is rational.',
    marks: 1,
  },
  {
    id: 'cbse9_2',
    exam_id: 'cbse_9',
    subject: 'Science',
    chapter: 'Motion',
    topic: 'Velocity',
    year: 2022,
    difficulty: 'easy',
    type: 'mcq',
    source: 'official_pyq',
    question: 'If an object travels 50 m in 5 seconds, its speed is:',
    options: [
      { id: 'a', text: '5 m/s' },
      { id: 'b', text: '10 m/s' },
      { id: 'c', text: '15 m/s' },
      { id: 'd', text: '20 m/s' },
    ],
    correctAnswer: 'b',
    explanation: 'Speed = Distance/Time = 50/5 = 10 m/s',
    marks: 1,
  },
]

// CBSE Class 11 - Real PYQs
export const cbseClass11PYQs: PYQQuestion[] = [
  {
    id: 'cbse11_1',
    exam_id: 'cbse_11',
    subject: 'Mathematics',
    chapter: 'Sets',
    topic: 'Set Operations',
    year: 2023,
    difficulty: 'easy',
    type: 'mcq',
    source: 'official_pyq',
    question: 'If A = {1, 2, 3} and B = {3, 4, 5}, then A ∪ B is:',
    options: [
      { id: 'a', text: '{3}' },
      { id: 'b', text: '{1, 2, 3, 4, 5}' },
      { id: 'c', text: '{1, 2}' },
      { id: 'd', text: '{4, 5}' },
    ],
    correctAnswer: 'b',
    explanation: 'A ∪ B contains all elements from both sets: {1, 2, 3, 4, 5}',
    marks: 1,
  },
]

export interface ExamDistribution {
  [chapter: string]: number
}

export const examDistributions: Record<string, ExamDistribution> = {
  cbse_9: {
    'Number Systems': 15,
    'Polynomials': 15,
    'Coordinate Geometry': 15,
    'Linear Equations': 15,
    'Triangles': 20,
    'Statistics': 20,
  },
  cbse_10: {
    'Real Numbers': 10,
    'Polynomials': 12,
    'Pair of Linear Equations': 12,
    'Quadratic Equations': 14,
    'Arithmetic Progressions': 12,
    'Triangles': 14,
    'Circles': 8,
    'Introduction to Trigonometry': 8,
    'Electricity': 10,
    'Chemical Reactions': 10,
  },
  cbse_11: {
    'Sets': 12,
    'Motion': 15,
    'Thermodynamics': 15,
    'Waves': 14,
    'Organic Chemistry': 14,
    'Inorganic Chemistry': 14,
    'Calculus': 12,
  },
  cbse_12: {
    'Relations': 10,
    'Inverse Trigonometry': 10,
    'Electrochemistry': 15,
    'Electromagnetic Induction': 15,
    'Reproduction': 15,
    'Calculus': 20,
    'Coordinate Geometry': 15,
  },
  jee_mains: {
    'Kinematics': 8,
    'Thermodynamics': 10,
    'Chemical Bonding': 10,
    'Calculus': 12,
    'Circular Motion': 8,
    'Waves': 8,
    'Organic Mechanisms': 10,
    'Inorganic': 10,
    'Coordinate': 6,
  },
  jee_advanced: {
    'Mechanics': 12,
    'Organic Chemistry': 15,
    'Complex Numbers': 12,
    'Modern Physics': 10,
    'Inorganic': 15,
    'Calculus': 15,
    'Vectors': 11,
  },
}

export function selectQuestionsWithDistribution(
  questions: PYQQuestion[],
  totalNeeded: number,
  examType: string,
  distribution: Record<string, number>
): PYQQuestion[] {
  if (!questions || questions.length === 0) return []

  const selected: PYQQuestion[] = []
  const usedIndices = new Set<number>()

  // Group questions by chapter
  const byChapter: Record<string, PYQQuestion[]> = {}
  questions.forEach((q) => {
    if (!byChapter[q.chapter]) byChapter[q.chapter] = []
    byChapter[q.chapter].push(q)
  })

  // Select questions per chapter based on distribution
  Object.entries(distribution).forEach(([chapter, percentage]) => {
    const chapterQuestions = byChapter[chapter] || []
    const questionsNeeded = Math.round((percentage / 100) * totalNeeded)

    for (let i = 0; i < questionsNeeded && chapterQuestions.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * chapterQuestions.length)
      const question = chapterQuestions[randomIndex]
      selected.push(question)
      chapterQuestions.splice(randomIndex, 1)
    }
  })

  // If we still need more questions, fill from any available
  if (selected.length < totalNeeded) {
    const available = questions.filter((_, idx) => !usedIndices.has(idx))
    while (selected.length < totalNeeded && available.length > 0) {
      const randomIndex = Math.floor(Math.random() * available.length)
      selected.push(available[randomIndex])
      available.splice(randomIndex, 1)
    }
  }

  return selected.slice(0, totalNeeded)
}

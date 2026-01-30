// Pre-generated mock question bank - No API calls needed
// This avoids Gemini API quota issues by using stored questions

export function getQuestionBank() {
  return {
    // CBSE Class 10 - Mathematics
    cbse_10_mathematics_easy: generateCBSEMathQuestions('easy'),
    cbse_10_mathematics_medium: generateCBSEMathQuestions('medium'),
    cbse_10_mathematics_hard: generateCBSEMathQuestions('hard'),

    // CBSE Class 10 - Science
    cbse_10_science_easy: generateCBSEScienceQuestions('easy'),
    cbse_10_science_medium: generateCBSEScienceQuestions('medium'),
    cbse_10_science_hard: generateCBSEScienceQuestions('hard'),

    // CBSE Class 12 - Physics
    cbse_12_physics_easy: generateCBSEPhysicsQuestions('easy'),
    cbse_12_physics_medium: generateCBSEPhysicsQuestions('medium'),
    cbse_12_physics_hard: generateCBSEPhysicsQuestions('hard'),

    // CBSE Class 12 - Chemistry
    cbse_12_chemistry_easy: generateCBSEChemistryQuestions('easy'),
    cbse_12_chemistry_medium: generateCBSEChemistryQuestions('medium'),
    cbse_12_chemistry_hard: generateCBSEChemistryQuestions('hard'),

    // CBSE Class 12 - Mathematics
    cbse_12_mathematics_easy: generateCBSE12MathQuestions('easy'),
    cbse_12_mathematics_medium: generateCBSE12MathQuestions('medium'),
    cbse_12_mathematics_hard: generateCBSE12MathQuestions('hard'),

    // JEE Mains - All subjects
    jee_mains_null_easy: generateJEEMainsQuestions('easy'),
    jee_mains_null_medium: generateJEEMainsQuestions('medium'),
    jee_mains_null_hard: generateJEEMainsQuestions('hard'),

    // JEE Advanced - All subjects
    jee_advanced_null_easy: generateJEEAdvancedQuestions('easy'),
    jee_advanced_null_medium: generateJEEAdvancedQuestions('medium'),
    jee_advanced_null_hard: generateJEEAdvancedQuestions('hard'),
  }
}

function generateCBSEMathQuestions(difficulty: string) {
  const questions = [
    {
      question: 'If the roots of the equation x² + bx + c = 0 are 2 and 3, then the equation is:',
      options: [
        { id: 'a', text: 'x² + 5x + 6 = 0' },
        { id: 'b', text: 'x² - 5x + 6 = 0' },
        { id: 'c', text: 'x² + 6x + 5 = 0' },
        { id: 'd', text: 'x² - 6x + 5 = 0' },
      ],
      correctAnswer: 'b',
      type: 'single_correct',
      difficulty,
      topic: 'Quadratic Equations',
      year: 2023,
      explanation: 'Using Vieta\'s formulas: sum = 5, product = 6. Equation: x² - 5x + 6 = 0',
    },
    {
      question: 'The sum of the first n natural numbers is:',
      options: [
        { id: 'a', text: 'n(n+1)/2' },
        { id: 'b', text: 'n(n-1)/2' },
        { id: 'c', text: 'n²' },
        { id: 'd', text: 'n(n+1)(2n+1)/6' },
      ],
      correctAnswer: 'a',
      type: 'single_correct',
      difficulty,
      topic: 'Sequences and Series',
      year: 2022,
      explanation: 'The sum of first n natural numbers is n(n+1)/2',
    },
    {
      question: 'Find the derivative of sin(x) with respect to x:',
      options: [
        { id: 'a', text: 'cos(x)' },
        { id: 'b', text: '-cos(x)' },
        { id: 'c', text: 'sin(x)' },
        { id: 'd', text: 'tan(x)' },
      ],
      correctAnswer: 'a',
      type: 'single_correct',
      difficulty,
      topic: 'Calculus',
      year: 2023,
      explanation: 'd/dx[sin(x)] = cos(x)',
    },
    {
      question: 'What is the area of a triangle with sides 3, 4, and 5?',
      options: [
        { id: 'a', text: '6' },
        { id: 'b', text: '12' },
        { id: 'c', text: '8' },
        { id: 'd', text: '10' },
      ],
      correctAnswer: 'a',
      type: 'single_correct',
      difficulty,
      topic: 'Triangles',
      year: 2022,
      explanation: 'This is a right triangle (Pythagorean triple). Area = (1/2) × 3 × 4 = 6',
    },
    {
      question: 'Find the probability of getting a head when a coin is tossed:',
      options: [
        { id: 'a', text: '1/4' },
        { id: 'b', text: '1/3' },
        { id: 'c', text: '1/2' },
        { id: 'd', text: '2/3' },
      ],
      correctAnswer: 'c',
      type: 'single_correct',
      difficulty,
      topic: 'Probability',
      year: 2023,
      explanation: 'A fair coin has two equally likely outcomes. P(Head) = 1/2',
    },
    {
      question: 'What is the value of log₁₀(100)?',
      options: [
        { id: 'a', text: '1' },
        { id: 'b', text: '2' },
        { id: 'c', text: '10' },
        { id: 'd', text: '100' },
      ],
      correctAnswer: 'b',
      type: 'single_correct',
      difficulty,
      topic: 'Logarithms',
      year: 2022,
      explanation: 'log₁₀(100) = log₁₀(10²) = 2',
    },
    {
      question: 'Solve: 2x + 3 = 7',
      options: [
        { id: 'a', text: 'x = 2' },
        { id: 'b', text: 'x = 1' },
        { id: 'c', text: 'x = 3' },
        { id: 'd', text: 'x = 4' },
      ],
      correctAnswer: 'a',
      type: 'single_correct',
      difficulty,
      topic: 'Linear Equations',
      year: 2023,
      explanation: '2x = 7 - 3 = 4, so x = 2',
    },
    {
      question: 'What is the distance formula between two points (x₁, y₁) and (x₂, y₂)?',
      options: [
        { id: 'a', text: '√[(x₂-x₁)² + (y₂-y₁)²]' },
        { id: 'b', text: '(x₂-x₁) + (y₂-y₁)' },
        { id: 'c', text: '√[(x₂+x₁)² + (y₂+y₁)²]' },
        { id: 'd', text: '(x₂-x₁)(y₂-y₁)' },
      ],
      correctAnswer: 'a',
      type: 'single_correct',
      difficulty,
      topic: 'Coordinate Geometry',
      year: 2022,
      explanation: 'Distance = √[(x₂-x₁)² + (y₂-y₁)²]',
    },
    {
      question: 'If tan(θ) = 1, what is θ (in radians)?',
      options: [
        { id: 'a', text: 'π/4' },
        { id: 'b', text: 'π/2' },
        { id: 'c', text: 'π' },
        { id: 'd', text: 'π/3' },
      ],
      correctAnswer: 'a',
      type: 'single_correct',
      difficulty,
      topic: 'Trigonometry',
      year: 2023,
      explanation: 'tan(π/4) = 1',
    },
    {
      question: 'What is the value of 5!?',
      options: [
        { id: 'a', text: '24' },
        { id: 'b', text: '120' },
        { id: 'c', text: '100' },
        { id: 'd', text: '50' },
      ],
      correctAnswer: 'b',
      type: 'single_correct',
      difficulty,
      topic: 'Permutations and Combinations',
      year: 2022,
      explanation: '5! = 5 × 4 × 3 × 2 × 1 = 120',
    },
  ]

  return questions
}

function generateCBSEScienceQuestions(difficulty: string) {
  return [
    {
      question: 'Which gas do plants absorb from the atmosphere?',
      options: [
        { id: 'a', text: 'Oxygen' },
        { id: 'b', text: 'Carbon Dioxide' },
        { id: 'c', text: 'Nitrogen' },
        { id: 'd', text: 'Hydrogen' },
      ],
      correctAnswer: 'b',
      type: 'single_correct',
      difficulty,
      topic: 'Photosynthesis',
      year: 2023,
      explanation: 'Plants absorb CO₂ for photosynthesis',
    },
    {
      question: 'What is the SI unit of force?',
      options: [
        { id: 'a', text: 'Dyne' },
        { id: 'b', text: 'Joule' },
        { id: 'c', text: 'Newton' },
        { id: 'd', text: 'Pascal' },
      ],
      correctAnswer: 'c',
      type: 'single_correct',
      difficulty,
      topic: 'Motion and Force',
      year: 2022,
      explanation: 'The SI unit of force is Newton (N)',
    },
  ]
}

function generateCBSEPhysicsQuestions(difficulty: string) {
  return [
    {
      question: 'The velocity of light in vacuum is:',
      options: [
        { id: 'a', text: '3 × 10⁸ m/s' },
        { id: 'b', text: '3 × 10⁶ m/s' },
        { id: 'c', text: '3 × 10¹⁰ m/s' },
        { id: 'd', text: '3 × 10⁵ m/s' },
      ],
      correctAnswer: 'a',
      type: 'single_correct',
      difficulty,
      topic: 'Optics',
      year: 2023,
      explanation: 'Speed of light c = 3 × 10⁸ m/s',
    },
  ]
}

function generateCBSEChemistryQuestions(difficulty: string) {
  return [
    {
      question: 'What is the electron configuration of oxygen?',
      options: [
        { id: 'a', text: '1s² 2s² 2p⁴' },
        { id: 'b', text: '1s² 2s² 2p² ' },
        { id: 'c', text: '1s² 2s¹ 2p⁵' },
        { id: 'd', text: '1s¹ 2s² 2p⁴' },
      ],
      correctAnswer: 'a',
      type: 'single_correct',
      difficulty,
      topic: 'Atomic Structure',
      year: 2022,
      explanation: 'Oxygen (Z=8): 1s² 2s² 2p⁴',
    },
  ]
}

function generateCBSE12MathQuestions(difficulty: string) {
  return generateCBSEMathQuestions(difficulty)
}

function generateJEEMainsQuestions(difficulty: string) {
  // 75 total questions: 25 Physics, 25 Chemistry, 25 Math
  // Each section: 20 MCQ + 5 Integer
  const questions = []

  // Physics (1-25)
  for (let i = 1; i <= 25; i++) {
    const isInteger = i > 20
    questions.push({
      question: `Physics Question ${i}: ${getPhysicsQuestion(i)}`,
      options: isInteger
        ? [
            { id: 'a', text: '1' },
            { id: 'b', text: '2' },
            { id: 'c', text: '3' },
            { id: 'd', text: '4' },
          ]
        : [
            { id: 'a', text: 'Option A' },
            { id: 'b', text: 'Option B' },
            { id: 'c', text: 'Option C' },
            { id: 'd', text: 'Option D' },
          ],
      correctAnswer: isInteger ? 'b' : 'a',
      type: 'single_correct',
      difficulty,
      marks: 4,
      negativeMarks: -2,
      topic: 'Physics',
      year: 2024,
      explanation: 'Detailed solution for physics question',
    })
  }

  // Chemistry (26-50)
  for (let i = 26; i <= 50; i++) {
    const isInteger = i > 45
    questions.push({
      question: `Chemistry Question ${i - 25}: ${getChemistryQuestion(i - 25)}`,
      options: isInteger
        ? [
            { id: 'a', text: '10' },
            { id: 'b', text: '20' },
            { id: 'c', text: '30' },
            { id: 'd', text: '40' },
          ]
        : [
            { id: 'a', text: 'Option A' },
            { id: 'b', text: 'Option B' },
            { id: 'c', text: 'Option C' },
            { id: 'd', text: 'Option D' },
          ],
      correctAnswer: isInteger ? 'c' : 'b',
      type: 'single_correct',
      difficulty,
      marks: 4,
      negativeMarks: -2,
      topic: 'Chemistry',
      year: 2024,
      explanation: 'Detailed solution for chemistry question',
    })
  }

  // Mathematics (51-75)
  for (let i = 51; i <= 75; i++) {
    const isInteger = i > 70
    questions.push({
      question: `Mathematics Question ${i - 50}: ${getMathQuestion(i - 50)}`,
      options: isInteger
        ? [
            { id: 'a', text: '100' },
            { id: 'b', text: '200' },
            { id: 'c', text: '300' },
            { id: 'd', text: '400' },
          ]
        : [
            { id: 'a', text: 'Option A' },
            { id: 'b', text: 'Option B' },
            { id: 'c', text: 'Option C' },
            { id: 'd', text: 'Option D' },
          ],
      correctAnswer: isInteger ? 'd' : 'c',
      type: 'single_correct',
      difficulty,
      marks: 4,
      negativeMarks: -2,
      topic: 'Mathematics',
      year: 2024,
      explanation: 'Detailed solution for math question',
    })
  }

  return questions
}

function generateJEEAdvancedQuestions(difficulty: string) {
  // Same structure as JEE Mains but with multiple correct options
  const questions = generateJEEMainsQuestions(difficulty)

  // Mark every 5th question as multiple correct
  return questions.map((q, idx) => ({
    ...q,
    type: idx % 5 === 0 ? 'multiple_correct' : 'single_correct',
    correctAnswer: idx % 5 === 0 ? ['a', 'b'] : q.correctAnswer,
  }))
}

function getPhysicsQuestion(n: number): string {
  const questions = [
    'A projectile is thrown at 45 degrees. Find its range.',
    'Calculate the acceleration due to gravity on the moon.',
    'Find the moment of inertia of a solid sphere.',
    'Determine the electric field due to a point charge.',
    'Calculate the magnetic field in a solenoid.',
  ]
  return questions[n % questions.length] || 'Physics Question'
}

function getChemistryQuestion(n: number): string {
  const questions = [
    'Calculate the molar mass of H₂SO₄.',
    'Balance the equation: Fe + O₂ → Fe₂O₃',
    'Determine the oxidation state of sulfur in H₂SO₄.',
    'Calculate the pH of a 0.1 M HCl solution.',
    'Identify the reducing agent in: Zn + Cu²⁺ → Zn²⁺ + Cu',
  ]
  return questions[n % questions.length] || 'Chemistry Question'
}

function getMathQuestion(n: number): string {
  const questions = [
    'Find the limit of (x²-1)/(x-1) as x approaches 1.',
    'Integrate sin(x) from 0 to π.',
    'Find the determinant of a 3×3 matrix.',
    'Solve the differential equation dy/dx = 2x.',
    'Find the eigenvalues of a given matrix.',
  ]
  return questions[n % questions.length] || 'Math Question'
}

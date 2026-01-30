'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, Clock, CheckCircle, X } from 'lucide-react'

interface Question {
  id: string
  question_number: number
  question_text: string
  question_type: 'single_correct' | 'multiple_correct'
  options: Array<{ id: string; text: string }>
  correct_options: string[]
  marks: number
  negative_marks: number
  solution: string
  topic: string
}

interface MockTestInterfaceProps {
  mockTest: {
    id: string
    test_name: string
    total_questions: number
    total_marks: number
    time_limit_minutes: number
    marking_scheme: Record<string, number>
    questions: Question[]
  }
  onSubmit: (responses: Array<{ questionId: string; selectedOptions: string[]; timeSpent: number }>) => void
}

export function MockTestInterface({ mockTest, onSubmit }: MockTestInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<Record<string, string[]>>({})
  const [timeRemaining, setTimeRemaining] = useState(mockTest.time_limit_minutes * 60)
  const [testStarted, setTestStarted] = useState(false)
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({})
  const [currentQuestionStartTime, setCurrentQuestionStartTime] = useState<number>(0)

  useEffect(() => {
    if (!testStarted) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [testStarted])

  const handleAutoSubmit = useCallback(() => {
    console.log('[v0] Auto-submitting test due to time limit')
    submitTest()
  }, [])

  const startTest = () => {
    setTestStarted(true)
    setCurrentQuestionStartTime(Date.now())
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const question = mockTest.questions[currentQuestion]

  const handleOptionSelect = (optionId: string) => {
    const questionId = question.id

    if (question.question_type === 'single_correct') {
      setResponses((prev) => ({
        ...prev,
        [questionId]: [optionId],
      }))
    } else {
      // Multiple correct - toggle selection
      setResponses((prev) => {
        const current = prev[questionId] || []
        const newOptions = current.includes(optionId)
          ? current.filter((o) => o !== optionId)
          : [...current, optionId]
        return {
          ...prev,
          [questionId]: newOptions,
        }
      })
    }
  }

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      // Record time for current question
      const timeSpent = Math.floor((Date.now() - currentQuestionStartTime) / 1000)
      setQuestionTimes((prev) => ({
        ...prev,
        [question.id]: (prev[question.id] || 0) + timeSpent,
      }))

      setCurrentQuestion(currentQuestion - 1)
      setCurrentQuestionStartTime(Date.now())
    }
  }

  const goToNext = () => {
    if (currentQuestion < mockTest.total_questions - 1) {
      // Record time for current question
      const timeSpent = Math.floor((Date.now() - currentQuestionStartTime) / 1000)
      setQuestionTimes((prev) => ({
        ...prev,
        [question.id]: (prev[question.id] || 0) + timeSpent,
      }))

      setCurrentQuestion(currentQuestion + 1)
      setCurrentQuestionStartTime(Date.now())
    }
  }

  const submitTest = () => {
    // Record time for last question
    const timeSpent = Math.floor((Date.now() - currentQuestionStartTime) / 1000)
    setQuestionTimes((prev) => ({
      ...prev,
      [question.id]: (prev[question.id] || 0) + timeSpent,
    }))

    const formattedResponses = mockTest.questions.map((q) => ({
      questionId: q.id,
      selectedOptions: responses[q.id] || [],
      timeSpent: questionTimes[q.id] || 0,
    }))

    onSubmit(formattedResponses)
  }

  if (!testStarted) {
    return (
      <Card className="p-8 border-border text-center space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">{mockTest.test_name}</h2>
          <p className="text-muted-foreground">
            {mockTest.total_questions} Questions | {mockTest.total_marks} Marks | {mockTest.time_limit_minutes}{' '}
            Minutes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 py-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Marking Scheme:</strong>
            </p>
            <p className="text-sm">
              +{mockTest.marking_scheme.correct} for correct | {mockTest.marking_scheme.incorrect}{' '}
              for incorrect
            </p>
          </div>
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Instructions:</strong>
            </p>
            <p className="text-sm">Read each question carefully before answering</p>
          </div>
        </div>

        <Button
          onClick={startTest}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-lg px-8"
        >
          Start Test
        </Button>
      </Card>
    )
  }

  const isTimeWarning = timeRemaining < 300 // 5 minutes

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {/* Main Question Area */}
      <div className="md:col-span-3 space-y-4">
        {/* Timer Header */}
        <Card className={`p-4 border-border ${isTimeWarning ? 'bg-red-500/10 border-red-500/30' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Question {currentQuestion + 1} of {mockTest.total_questions}</p>
              <p className="text-lg font-semibold text-foreground">{question?.topic}</p>
            </div>
            <div className={`flex items-center gap-2 text-lg font-mono ${isTimeWarning ? 'text-red-400' : 'text-cyan-400'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeRemaining)}
            </div>
          </div>
        </Card>

        {/* Question Card */}
        <Card className="p-6 border-border space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{question?.question_text}</h3>
            {question?.question_type === 'multiple_correct' && (
              <p className="text-xs text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Multiple correct options possible
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question?.options.map((option) => {
              const isSelected = responses[question.id]?.includes(option.id)
              const isCorrect = question.correct_options.includes(option.id)

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-border hover:border-cyan-500/50 bg-background'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-border'
                      }`}
                    >
                      {isSelected && <CheckCircle className="w-4 h-4 text-background" />}
                    </div>
                    <span className="text-foreground">{option.text}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="p-3 bg-background border border-border rounded text-xs text-muted-foreground">
            Marks: +{question?.marks} | Negative: {question?.negative_marks}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3 justify-between">
          <Button
            onClick={goToPrevious}
            disabled={currentQuestion === 0}
            variant="outline"
            className="border-border bg-transparent"
          >
            Previous
          </Button>

          <Button
            onClick={submitTest}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Submit Test
          </Button>

          <Button
            onClick={goToNext}
            disabled={currentQuestion === mockTest.total_questions - 1}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Question Navigator Sidebar */}
      <div className="md:col-span-1">
        <Card className="p-4 border-border sticky top-4">
          <h4 className="font-semibold text-foreground mb-3">Questions</h4>
          <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
            {mockTest.questions.map((q, idx) => {
              const isAnswered = responses[q.id]?.length > 0
              const isCurrentQuestion = idx === currentQuestion

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    // Record time
                    const timeSpent = Math.floor((Date.now() - currentQuestionStartTime) / 1000)
                    setQuestionTimes((prev) => ({
                      ...prev,
                      [question.id]: (prev[question.id] || 0) + timeSpent,
                    }))
                    setCurrentQuestion(idx)
                    setCurrentQuestionStartTime(Date.now())
                  }}
                  className={`w-full h-8 rounded text-xs font-medium transition-colors ${
                    isCurrentQuestion
                      ? 'bg-cyan-500 text-white'
                      : isAnswered
                        ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          <div className="mt-4 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-cyan-500" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500/30 border border-green-500" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-muted" />
              <span>Not answered</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

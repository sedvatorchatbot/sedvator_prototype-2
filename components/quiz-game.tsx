"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle, XCircle, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface Question {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

interface Quiz {
  id: string
  title: string
  questions: Question[]
}

interface QuizGameProps {
  quiz: Quiz
  onBack: () => void
}

export function QuizGame({ quiz, onBack }: QuizGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [startTime] = useState(Date.now())

  const currentQuestion = quiz.questions[currentIndex]
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100

  const handleSelectAnswer = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    setShowResult(true)
    setAnswers([...answers, selectedAnswer])

    if (selectedAnswer === currentQuestion.correctIndex) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = async () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setIsComplete(true)

      // Save attempt to database
      try {
        await fetch("/api/quiz/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizId: quiz.id,
            score: score + (selectedAnswer === currentQuestion.correctIndex ? 1 : 0),
            totalQuestions: quiz.questions.length,
            timeTaken: Math.floor((Date.now() - startTime) / 1000),
            answers: [...answers, selectedAnswer],
          }),
        })
      } catch (error) {
        console.error("Failed to save attempt:", error)
      }
    }
  }

  if (isComplete) {
    const finalScore = score
    const percentage = Math.round((finalScore / quiz.questions.length) * 100)

    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-lg w-full border-primary/30 bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-primary/20 w-fit">
              <Trophy className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl text-foreground">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="text-6xl font-bold text-primary">{percentage}%</div>
            <p className="text-xl text-muted-foreground">
              You got {finalScore} out of {quiz.questions.length} questions correct
            </p>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Games
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setCurrentIndex(0)
                  setSelectedAnswer(null)
                  setShowResult(false)
                  setScore(0)
                  setAnswers([])
                  setIsComplete(false)
                }}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">{quiz.title}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {quiz.questions.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-primary">{score}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-2" />

        {/* Question */}
        <Card className="border-primary/30 bg-card">
          <CardHeader>
            <CardTitle className="text-xl text-foreground leading-relaxed">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={showResult}
                className={cn(
                  "w-full p-4 rounded-lg text-left transition-all border-2",
                  selectedAnswer === index && !showResult && "border-primary bg-primary/10",
                  showResult && index === currentQuestion.correctIndex && "border-green-500 bg-green-500/10",
                  showResult &&
                    selectedAnswer === index &&
                    index !== currentQuestion.correctIndex &&
                    "border-red-500 bg-red-500/10",
                  !showResult && selectedAnswer !== index && "border-border bg-secondary/50 hover:border-primary/50",
                  showResult &&
                    selectedAnswer !== index &&
                    index !== currentQuestion.correctIndex &&
                    "border-border bg-secondary/30 opacity-50",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-foreground">{option}</span>
                  {showResult && index === currentQuestion.correctIndex && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {showResult && selectedAnswer === index && index !== currentQuestion.correctIndex && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Explanation */}
        {showResult && currentQuestion.explanation && (
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-accent">Explanation: </span>
                {currentQuestion.explanation}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          {!showResult ? (
            <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null} size="lg">
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuestion} size="lg">
              {currentIndex < quiz.questions.length - 1 ? "Next Question" : "See Results"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

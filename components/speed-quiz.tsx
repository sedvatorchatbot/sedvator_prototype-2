"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Zap, Trophy, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Question {
  question: string
  options: string[]
  correctIndex: number
}

interface Quiz {
  id: string
  title: string
  questions: Question[]
}

interface SpeedQuizProps {
  quiz: Quiz
  onBack: () => void
}

export function SpeedQuiz({ quiz, onBack }: SpeedQuizProps) {
  const [gameState, setGameState] = useState<"ready" | "playing" | "complete">("ready")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)

  const currentQuestion = quiz.questions[currentIndex % quiz.questions.length]

  useEffect(() => {
    if (gameState !== "playing") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("complete")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  const handleAnswer = useCallback(
    async (index: number) => {
      if (gameState !== "playing" || feedback) return

      const isCorrect = index === currentQuestion.correctIndex

      if (isCorrect) {
        setScore((s) => s + 10 + streak * 2)
        setStreak((s) => s + 1)
        setMaxStreak((m) => Math.max(m, streak + 1))
        setFeedback("correct")
      } else {
        setStreak(0)
        setFeedback("wrong")
      }

      setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % quiz.questions.length)
        setFeedback(null)
      }, 300)
    },
    [gameState, feedback, currentQuestion, streak, quiz.questions.length],
  )

  const saveScore = async () => {
    try {
      await fetch("/api/game/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "speed_quiz",
          score,
          streak: maxStreak,
          timeTaken: 60,
          metadata: { quizId: quiz.id },
        }),
      })
    } catch (error) {
      console.error("Failed to save score:", error)
    }
  }

  useEffect(() => {
    if (gameState === "complete") {
      saveScore()
    }
  }, [gameState])

  if (gameState === "ready") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-lg w-full border-primary/30 bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-primary/20 w-fit animate-pulse">
              <Zap className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl text-foreground">Speed Quiz Challenge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              Answer as many questions as possible in 60 seconds! Build streaks for bonus points.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-secondary/50">
                <Clock className="h-6 w-6 mx-auto text-primary mb-1" />
                <p className="text-sm text-muted-foreground">60 seconds</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <Zap className="h-6 w-6 mx-auto text-accent mb-1" />
                <p className="text-sm text-muted-foreground">Streak bonus</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <Trophy className="h-6 w-6 mx-auto text-yellow-500 mb-1" />
                <p className="text-sm text-muted-foreground">Beat your best</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button className="flex-1" onClick={() => setGameState("playing")}>
                Start!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === "complete") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-lg w-full border-primary/30 bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-primary/20 w-fit">
              <Trophy className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl text-foreground">Time's Up!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="text-6xl font-bold text-primary">{score}</div>
            <p className="text-xl text-muted-foreground">Max Streak: {maxStreak}</p>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Games
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setGameState("ready")
                  setCurrentIndex(0)
                  setScore(0)
                  setStreak(0)
                  setMaxStreak(0)
                  setTimeLeft(60)
                }}
              >
                Play Again
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
          <div className="flex items-center gap-4">
            <div className={cn("text-4xl font-bold", timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-primary")}>
              {timeLeft}s
            </div>
          </div>
          <div className="flex items-center gap-6">
            {streak > 0 && (
              <div className="flex items-center gap-2 text-accent animate-pulse">
                <Zap className="h-5 w-5" />
                <span className="font-bold">{streak}x</span>
              </div>
            )}
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{score}</p>
            </div>
          </div>
        </div>

        {/* Question */}
        <Card
          className={cn(
            "border-2 transition-colors",
            feedback === "correct" && "border-green-500 bg-green-500/10",
            feedback === "wrong" && "border-red-500 bg-red-500/10",
            !feedback && "border-primary/30 bg-card",
          )}
        >
          <CardHeader>
            <CardTitle className="text-xl text-foreground leading-relaxed">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={!!feedback}
                className={cn(
                  "p-4 rounded-lg text-left transition-all border-2",
                  "border-border bg-secondary/50 hover:border-primary hover:bg-primary/10",
                  "active:scale-95",
                )}
              >
                <span className="text-foreground">{option}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

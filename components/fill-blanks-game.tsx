"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Trophy, CheckCircle, XCircle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface Question {
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

interface Quiz {
  id: string
  title: string
  questions: Question[]
}

interface FillBlanksGameProps {
  quiz: Quiz
  onBack: () => void
}

interface BlankQuestion {
  original: string
  blankedWords: string[]
  sentence: string
  hint: string
}

export function FillBlanksGame({ quiz, onBack }: FillBlanksGameProps) {
  const [gameState, setGameState] = useState<"ready" | "playing" | "complete">("ready")
  const [questions, setQuestions] = useState<BlankQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [startTime, setStartTime] = useState(0)

  // Turn complete answer statements into contextual prompts with 2–3 meaningful blanks.
  const createBlankQuestions = () => {
    const blanks: BlankQuestion[] = []

    quiz.questions.forEach((q) => {
      const correctAnswer = q.options[q.correctIndex]?.trim()
      if (!correctAnswer) return

      const words = correctAnswer.split(/\s+/)
      const candidates = words.filter((word) => word.replace(/[^a-zA-Z]/g, "").length >= 4)
      if (candidates.length < 2) return

      const blankedWords = candidates.slice(0, Math.min(3, candidates.length)).map((word) =>
        word.toLowerCase().replace(/[^a-z0-9]/gi, ""),
      )
      let candidateIndex = 0
      const sentence = words
        .map((word) => {
          const normalized = word.toLowerCase().replace(/[^a-z0-9]/gi, "")
          if (candidateIndex < blankedWords.length && normalized === blankedWords[candidateIndex]) {
            candidateIndex += 1
            return "_____"
          }
          return word
        })
        .join(" ")

      blanks.push({
        original: correctAnswer,
        blankedWords,
        sentence: `${q.question} ${sentence}`,
        hint: q.explanation?.replace(/^the correct answer is:?\s*/i, "") || "A general description of the concept in the answer.",
      })
    })

    return blanks.slice(0, 8)
  }

  useEffect(() => {
    if (gameState === "playing") {
      setQuestions(createBlankQuestions())
      setCurrentIndex(0)
      setScore(0)
      setStartTime(Date.now())
    }
  }, [gameState])

  const handleSubmit = () => {
    const answers = userAnswer
      .split(",")
      .map((answer) => answer.trim().toLowerCase().replace(/[^a-z0-9]/gi, ""))
      .filter(Boolean)
    const expected = questions[currentIndex].blankedWords
    const correct = expected.every((word, index) => answers[index] === word) && answers.length === expected.length
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore((s) => s + 1)
    }
  }

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
      setUserAnswer("")
      setShowResult(false)
    } else {
      setGameState("complete")
      saveScore()
    }
  }

  const saveScore = async () => {
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      await fetch("/api/game/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "fill_blanks",
          score: Math.round((score / questions.length) * 100),
          timeTaken,
          streak: score,
          metadata: { quizId: quiz.id },
        }),
      })
    } catch (error) {
      console.error("Failed to save score:", error)
    }
  }

  if (gameState === "ready") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-lg w-full border-orange-500/30 bg-card">
          <CardContent className="pt-8 space-y-6 text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-orange-500/20 w-fit">
              <Sparkles className="h-12 w-12 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Fill in the Blanks</h2>
            <p className="text-muted-foreground">
              Complete sentences by typing the missing word. Test your knowledge of key concepts!
            </p>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Based on: <span className="text-foreground font-medium">{quiz.title}</span>
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={() => setGameState("playing")}>
                Start Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === "complete" || questions.length === 0) {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-lg w-full border-orange-500/30 bg-card">
          <CardContent className="pt-8 space-y-6 text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-orange-500/20 w-fit">
              <Trophy className="h-12 w-12 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Game Complete!</h2>

            <div className="text-6xl font-bold text-primary">{percentage}%</div>
            <p className="text-xl text-muted-foreground">
              You got {score} out of {questions.length} correct
            </p>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={() => setGameState("ready")}>
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
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
        <Card className="border-orange-500/30 bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-muted-foreground">Complete the sentence:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xl text-foreground leading-relaxed">{currentQuestion.sentence}</p>
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-orange-500">Hint: </span>
                {currentQuestion.hint}
              </p>
            </div>

            {!showResult ? (
              <div className="space-y-4">
                <Input
                  placeholder={`Type ${currentQuestion.blankedWords.length} answers, separated by commas...`}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229 && userAnswer) {
                      handleSubmit()
                    }
                  }}
                  className="bg-input text-lg"
                  autoFocus
                />
                <Button onClick={handleSubmit} disabled={!userAnswer} className="w-full" size="lg">
                  Check Answer
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className={cn(
                    "p-4 rounded-lg flex items-center gap-3",
                    isCorrect ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30",
                  )}
                >
                  {isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                  <div>
                    <p className={cn("font-medium", isCorrect ? "text-green-500" : "text-red-500")}>
                      {isCorrect ? "Correct!" : "Not quite..."}
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-muted-foreground">
                        The correct answers were: <span className="text-foreground">{currentQuestion.blankedWords.join(", ")}</span>
                      </p>
                    )}
                  </div>
                </div>

                <Button onClick={handleNext} className="w-full" size="lg">
                  {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

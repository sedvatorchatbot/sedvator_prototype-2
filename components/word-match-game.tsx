"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Trophy, Clock, Shuffle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FlashCard {
  term: string
  definition: string
}

interface FlashcardSet {
  id: string
  title: string
  cards: FlashCard[]
}

interface WordMatchGameProps {
  flashcardSet: FlashcardSet
  onBack: () => void
}

export function WordMatchGame({ flashcardSet, onBack }: WordMatchGameProps) {
  const [gameState, setGameState] = useState<"ready" | "playing" | "complete">("ready")
  const [terms, setTerms] = useState<{ id: number; text: string; matched: boolean }[]>([])
  const [definitions, setDefinitions] = useState<{ id: number; text: string; matched: boolean }[]>([])
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null)
  const [selectedDef, setSelectedDef] = useState<number | null>(null)
  const [matches, setMatches] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)

  // Use only first 6 cards for manageable gameplay
  const gameCards = useMemo(() => flashcardSet.cards.slice(0, 6), [flashcardSet.cards])

  const initializeGame = useCallback(() => {
    const shuffledTerms = gameCards
      .map((card, i) => ({ id: i, text: card.term, matched: false }))
      .sort(() => Math.random() - 0.5)

    const shuffledDefs = gameCards
      .map((card, i) => ({ id: i, text: card.definition, matched: false }))
      .sort(() => Math.random() - 0.5)

    setTerms(shuffledTerms)
    setDefinitions(shuffledDefs)
    setMatches(0)
    setAttempts(0)
    setTimeElapsed(0)
    setSelectedTerm(null)
    setSelectedDef(null)
  }, [gameCards])

  useEffect(() => {
    if (gameState === "playing") {
      initializeGame()
    }
  }, [gameState, initializeGame])

  useEffect(() => {
    if (gameState !== "playing") return

    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  useEffect(() => {
    if (selectedTerm !== null && selectedDef !== null) {
      setAttempts((a) => a + 1)

      if (selectedTerm === selectedDef) {
        setFeedback("correct")
        setTimeout(() => {
          setTerms((t) => t.map((term) => (term.id === selectedTerm ? { ...term, matched: true } : term)))
          setDefinitions((d) => d.map((def) => (def.id === selectedDef ? { ...def, matched: true } : def)))
          setMatches((m) => m + 1)
          setSelectedTerm(null)
          setSelectedDef(null)
          setFeedback(null)

          if (matches + 1 === gameCards.length) {
            setGameState("complete")
            saveScore()
          }
        }, 500)
      } else {
        setFeedback("wrong")
        setTimeout(() => {
          setSelectedTerm(null)
          setSelectedDef(null)
          setFeedback(null)
        }, 800)
      }
    }
  }, [selectedTerm, selectedDef])

  const saveScore = async () => {
    try {
      const accuracy = Math.round((gameCards.length / attempts) * 100)
      await fetch("/api/game/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "word_match",
          score: accuracy,
          timeTaken: timeElapsed,
          metadata: { flashcardSetId: flashcardSet.id, attempts },
        }),
      })
    } catch (error) {
      console.error("Failed to save score:", error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (gameState === "ready") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-lg w-full border-green-500/30 bg-card">
          <CardContent className="pt-8 space-y-6 text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-green-500/20 w-fit">
              <Shuffle className="h-12 w-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Word Match</h2>
            <p className="text-muted-foreground">
              Match each term with its correct definition. Click a term, then click its matching definition!
            </p>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Playing with: <span className="text-foreground font-medium">{flashcardSet.title}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">{gameCards.length} pairs to match</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => setGameState("playing")}>
                Start Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === "complete") {
    const accuracy = Math.round((gameCards.length / attempts) * 100)

    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-lg w-full border-green-500/30 bg-card">
          <CardContent className="pt-8 space-y-6 text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-green-500/20 w-fit">
              <Trophy className="h-12 w-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">All Matched!</h2>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-primary">{accuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-primary">{formatTime(timeElapsed)}</p>
                <p className="text-sm text-muted-foreground">Time</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-primary">{attempts}</p>
                <p className="text-sm text-muted-foreground">Attempts</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setGameState("ready")
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span className="font-mono text-lg">{formatTime(timeElapsed)}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-bold text-foreground">
                {matches}/{gameCards.length}
              </span>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Terms Column */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">Terms</h3>
            {terms.map((term) => (
              <button
                key={`term-${term.id}`}
                onClick={() => !term.matched && setSelectedTerm(term.id)}
                disabled={term.matched}
                className={cn(
                  "w-full p-4 rounded-lg text-left transition-all border-2",
                  term.matched && "opacity-50 border-green-500 bg-green-500/10",
                  !term.matched && selectedTerm === term.id && "border-primary bg-primary/10",
                  !term.matched && selectedTerm !== term.id && "border-border bg-secondary/50 hover:border-primary/50",
                  feedback === "correct" && selectedTerm === term.id && "border-green-500 bg-green-500/20",
                  feedback === "wrong" && selectedTerm === term.id && "border-red-500 bg-red-500/20 animate-shake",
                )}
              >
                <span className="text-foreground font-medium">{term.text}</span>
              </button>
            ))}
          </div>

          {/* Definitions Column */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">Definitions</h3>
            {definitions.map((def) => (
              <button
                key={`def-${def.id}`}
                onClick={() => !def.matched && selectedTerm !== null && setSelectedDef(def.id)}
                disabled={def.matched || selectedTerm === null}
                className={cn(
                  "w-full p-4 rounded-lg text-left transition-all border-2",
                  def.matched && "opacity-50 border-green-500 bg-green-500/10",
                  !def.matched && selectedDef === def.id && "border-accent bg-accent/10",
                  !def.matched &&
                    selectedDef !== def.id &&
                    selectedTerm !== null &&
                    "border-border bg-secondary/50 hover:border-accent/50",
                  !def.matched && selectedTerm === null && "border-border bg-secondary/30 opacity-60",
                  feedback === "correct" && selectedDef === def.id && "border-green-500 bg-green-500/20",
                  feedback === "wrong" && selectedDef === def.id && "border-red-500 bg-red-500/20 animate-shake",
                )}
              >
                <span className="text-foreground text-sm">{def.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <p className="text-center text-sm text-muted-foreground">
          {selectedTerm === null ? "Click a term to select it" : "Now click the matching definition"}
        </p>
      </div>
    </div>
  )
}

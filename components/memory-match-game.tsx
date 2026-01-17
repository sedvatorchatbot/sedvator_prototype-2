"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Trophy, Clock, Brain } from "lucide-react"
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

interface MemoryCard {
  id: number
  pairId: number
  content: string
  type: "term" | "definition"
  isFlipped: boolean
  isMatched: boolean
}

interface MemoryMatchGameProps {
  flashcardSet: FlashcardSet
  onBack: () => void
}

export function MemoryMatchGame({ flashcardSet, onBack }: MemoryMatchGameProps) {
  const [gameState, setGameState] = useState<"ready" | "playing" | "complete">("ready")
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matches, setMatches] = useState(0)
  const [moves, setMoves] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isChecking, setIsChecking] = useState(false)

  const gameCards = flashcardSet.cards.slice(0, 6)

  const initializeGame = useCallback(() => {
    const memoryCards: MemoryCard[] = []
    gameCards.forEach((card, index) => {
      memoryCards.push({
        id: index * 2,
        pairId: index,
        content: card.term,
        type: "term",
        isFlipped: false,
        isMatched: false,
      })
      memoryCards.push({
        id: index * 2 + 1,
        pairId: index,
        content: card.definition,
        type: "definition",
        isFlipped: false,
        isMatched: false,
      })
    })

    const shuffled = memoryCards.sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setMatches(0)
    setMoves(0)
    setTimeElapsed(0)
    setFlippedCards([])
  }, [gameCards])

  useEffect(() => {
    if (gameState === "playing") {
      initializeGame()
    }
  }, [gameState]) // Remove initializeGame from deps to prevent re-triggering

  useEffect(() => {
    if (gameState === "playing" && matches > 0 && matches === gameCards.length) {
      const timer = setTimeout(() => {
        setGameState("complete")
        saveScore()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [matches, gameCards.length, gameState])

  useEffect(() => {
    if (gameState !== "playing") return

    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  const handleCardClick = (cardId: number) => {
    if (isChecking) return
    if (flippedCards.includes(cardId)) return

    const card = cards.find((c) => c.id === cardId)
    if (!card || card.isMatched) return

    const newFlipped = [...flippedCards, cardId]
    setFlippedCards(newFlipped)

    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)))

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1)
      setIsChecking(true)

      const [firstId, secondId] = newFlipped
      const firstCard = cards.find((c) => c.id === firstId)!
      const secondCard = cards.find((c) => c.id === secondId)!

      if (firstCard.pairId === secondCard.pairId && firstCard.type !== secondCard.type) {
        // Match found!
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c)))
          setMatches((m) => m + 1)
          setFlippedCards([])
          setIsChecking(false)
        }, 600)
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c)))
          setFlippedCards([])
          setIsChecking(false)
        }, 1000)
      }
    }
  }

  const saveScore = async () => {
    try {
      const score = Math.max(0, 100 - (moves - gameCards.length) * 5)
      await fetch("/api/game/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "memory_match",
          score,
          timeTaken: timeElapsed,
          metadata: { flashcardSetId: flashcardSet.id, moves },
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
        <Card className="max-w-lg w-full border-purple-500/30 bg-card">
          <CardContent className="pt-8 space-y-6 text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-purple-500/20 w-fit">
              <Brain className="h-12 w-12 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Memory Match</h2>
            <p className="text-muted-foreground">
              Flip cards to find matching term-definition pairs. Try to complete with the fewest moves!
            </p>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Playing with: <span className="text-foreground font-medium">{flashcardSet.title}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">{gameCards.length} pairs to find</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => setGameState("playing")}>
                Start Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === "complete") {
    const score = Math.max(0, 100 - (moves - gameCards.length) * 5)

    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-lg w-full border-purple-500/30 bg-card">
          <CardContent className="pt-8 space-y-6 text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-purple-500/20 w-fit">
              <Trophy className="h-12 w-12 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">All Pairs Found!</h2>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-primary">{score}</p>
                <p className="text-sm text-muted-foreground">Score</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-primary">{formatTime(timeElapsed)}</p>
                <p className="text-sm text-muted-foreground">Time</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-primary">{moves}</p>
                <p className="text-sm text-muted-foreground">Moves</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => setGameState("ready")}>
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
          <h1 className="text-xl font-bold text-foreground">{flashcardSet.title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(timeElapsed)}</span>
            </div>
            <div className="text-foreground">
              <span className="font-bold">{moves}</span> moves
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched || card.isFlipped || isChecking}
              className={cn(
                "aspect-[3/4] rounded-xl transition-all duration-300 transform",
                "border-2 flex items-center justify-center p-3",
                card.isMatched && "border-green-500 bg-green-500/10 opacity-60",
                card.isFlipped && !card.isMatched && "border-purple-500 bg-purple-500/10",
                !card.isFlipped && !card.isMatched && "border-border bg-secondary hover:border-purple-500/50",
              )}
              style={{
                perspective: "1000px",
              }}
            >
              {card.isFlipped || card.isMatched ? (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase mb-1">
                    {card.type === "term" ? "Term" : "Definition"}
                  </p>
                  <p
                    className={cn(
                      "font-medium leading-tight",
                      card.type === "term" ? "text-foreground" : "text-sm text-muted-foreground",
                    )}
                  >
                    {card.content.length > 50 ? card.content.substring(0, 50) + "..." : card.content}
                  </p>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 text-lg">?</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-muted-foreground">Pairs found:</span>
          <span className="font-bold text-foreground">
            {matches}/{gameCards.length}
          </span>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, RotateCcw, Check, X, Trophy, Shuffle } from "lucide-react"
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

interface FlashcardGameProps {
  flashcardSet: FlashcardSet
  onBack: () => void
}

export function FlashcardGame({ flashcardSet, onBack }: FlashcardGameProps) {
  const [cards, setCards] = useState(flashcardSet.cards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [knownCards, setKnownCards] = useState<number[]>([])
  const [reviewCards, setReviewCards] = useState<number[]>([])
  const [isComplete, setIsComplete] = useState(false)

  const currentCard = cards[currentIndex]
  const progress = ((knownCards.length + reviewCards.length) / cards.length) * 100

  const handleFlip = () => setIsFlipped(!isFlipped)

  const handleKnown = async () => {
    setKnownCards([...knownCards, currentIndex])
    moveToNext()
  }

  const handleReview = () => {
    setReviewCards([...reviewCards, currentIndex])
    moveToNext()
  }

  const moveToNext = () => {
    const remaining = cards.length - knownCards.length - reviewCards.length - 1
    if (remaining <= 0) {
      setIsComplete(true)
      saveScore()
    } else {
      let nextIndex = currentIndex + 1
      while (nextIndex < cards.length && (knownCards.includes(nextIndex) || reviewCards.includes(nextIndex))) {
        nextIndex++
      }
      if (nextIndex >= cards.length) {
        nextIndex = 0
        while (knownCards.includes(nextIndex) || reviewCards.includes(nextIndex)) {
          nextIndex++
        }
      }
      setCurrentIndex(nextIndex)
      setIsFlipped(false)
    }
  }

  const saveScore = async () => {
    try {
      await fetch("/api/game/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: "flashcard_memory",
          score: knownCards.length,
          streak: knownCards.length,
          metadata: {
            flashcardSetId: flashcardSet.id,
            totalCards: cards.length,
            reviewCards: reviewCards.length,
          },
        }),
      })
    } catch (error) {
      console.error("Failed to save score:", error)
    }
  }

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
    setKnownCards([])
    setReviewCards([])
    setIsComplete(false)
  }

  const restartWithReview = () => {
    // Only keep the cards marked for review
    const reviewOnly = reviewCards.map((i) => cards[i])
    if (reviewOnly.length > 0) {
      setCards(reviewOnly)
    }
    setCurrentIndex(0)
    setIsFlipped(false)
    setKnownCards([])
    setReviewCards([])
    setIsComplete(false)
  }

  if (isComplete) {
    const knownCount = knownCards.length
    const reviewCount = reviewCards.length

    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-lg w-full border-primary/30 bg-card">
          <CardContent className="pt-8 space-y-6 text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-primary/20 w-fit">
              <Trophy className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Session Complete!</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <Check className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-bold text-green-500">{knownCount}</p>
                <p className="text-sm text-muted-foreground">Mastered</p>
              </div>
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <RotateCcw className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                <p className="text-2xl font-bold text-orange-500">{reviewCount}</p>
                <p className="text-sm text-muted-foreground">Need Review</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {reviewCount > 0 && (
                <Button onClick={restartWithReview} className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Review {reviewCount} Cards
                </Button>
              )}
              <Button variant="outline" onClick={shuffleCards} className="w-full bg-transparent">
                <Shuffle className="h-4 w-4 mr-2" />
                Start Over (Shuffled)
              </Button>
              <Button variant="ghost" onClick={onBack} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Games
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">{flashcardSet.title}</h1>
            <p className="text-sm text-muted-foreground">
              {cards.length - knownCards.length - reviewCards.length} cards remaining
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={shuffleCards} className="text-primary">
            <Shuffle className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="text-green-500">{knownCards.length} known</span>
            <span className="text-orange-500">{reviewCards.length} review</span>
          </div>
        </div>

        {/* Flashcard */}
        <div className="perspective-1000 cursor-pointer" onClick={handleFlip}>
          <div
            className={cn(
              "relative w-full aspect-[4/3] transition-transform duration-500 transform-style-preserve-3d",
              isFlipped && "rotate-y-180",
            )}
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front */}
            <Card
              className="absolute inset-0 border-primary/30 bg-card flex items-center justify-center backface-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              <CardContent className="text-center p-8">
                <p className="text-xs text-muted-foreground mb-4">TERM</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{currentCard.term}</p>
                <p className="text-sm text-muted-foreground mt-8">Tap to flip</p>
              </CardContent>
            </Card>

            {/* Back */}
            <Card
              className="absolute inset-0 border-accent/30 bg-card flex items-center justify-center"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <CardContent className="text-center p-8">
                <p className="text-xs text-muted-foreground mb-4">DEFINITION</p>
                <p className="text-xl md:text-2xl text-foreground leading-relaxed">{currentCard.definition}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleReview}
            className="flex-1 max-w-[150px] border-orange-500/50 text-orange-500 hover:bg-orange-500/10 bg-transparent"
          >
            <X className="h-5 w-5 mr-2" />
            Review
          </Button>
          <Button size="lg" onClick={handleKnown} className="flex-1 max-w-[150px] bg-green-600 hover:bg-green-700">
            <Check className="h-5 w-5 mr-2" />
            Got it!
          </Button>
        </div>
      </div>
    </div>
  )
}

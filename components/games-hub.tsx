"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Zap, FileText, Trophy, Plus, ArrowLeft, Upload, Gamepad2, Puzzle, Target, Sparkles } from "lucide-react"
import Link from "next/link"
import { QuizGame } from "./quiz-game"
import { SpeedQuiz } from "./speed-quiz"
import { FlashcardGame } from "./flashcard-game"
import { WordMatchGame } from "./word-match-game"
import { MemoryMatchGame } from "./memory-match-game"
import { FillBlanksGame } from "./fill-blanks-game"

interface Quiz {
  id: string
  title: string
  topic: string
  difficulty?: string
  questions: any[]
  created_at: string
}

interface FlashcardSet {
  id: string
  title: string
  topic: string
  cards: any[]
  created_at: string
}

interface GameScore {
  id: string
  game_type: string
  score: number
  streak: number
  created_at: string
}

interface GamesHubProps {
  quizzes: Quiz[]
  flashcardSets: FlashcardSet[]
  topScores: GameScore[]
}

const DIFFICULTY_LEVELS = [
  { value: "basic", label: "Basic", description: "Simple concepts for beginners" },
  { value: "intermediate", label: "Intermediate", description: "Standard difficulty" },
  { value: "advanced", label: "Advanced", description: "Challenging questions" },
  { value: "expert", label: "Expert", description: "Complex problem-solving" },
]

export function GamesHub({ quizzes, flashcardSets, topScores }: GamesHubProps) {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("quizzes")
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [selectedFlashcards, setSelectedFlashcards] = useState<FlashcardSet | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [createType, setCreateType] = useState<"quiz" | "flashcards">("quiz")
  const [topic, setTopic] = useState("")
  const [pdfContent, setPdfContent] = useState("")
  const [sourceType, setSourceType] = useState<"topic" | "pdf">("topic")
  const [difficulty, setDifficulty] = useState("intermediate")
  const [loading, setLoading] = useState(false)
  const [localQuizzes, setLocalQuizzes] = useState(quizzes)
  const [localFlashcards, setLocalFlashcards] = useState(flashcardSets)

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "quiz" || tab === "quizzes") {
      setActiveTab("quizzes")
    } else if (tab === "flashcards") {
      setActiveTab("flashcards")
    } else if (tab === "fun-games" || tab === "games") {
      setActiveTab("fun-games")
    } else if (tab === "leaderboard" || tab === "progress") {
      setActiveTab("leaderboard")
    }
  }, [searchParams])

  const handleCreateQuiz = async () => {
    if (!topic && sourceType === "topic") return
    if (!pdfContent && sourceType === "pdf") return

    setLoading(true)
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          content: pdfContent,
          sourceType,
          difficulty,
          questionCount: 10,
        }),
      })

      const data = await res.json()
      if (data.quiz) {
        setLocalQuizzes([data.quiz, ...localQuizzes])
        setSelectedQuiz(data.quiz)
        setActiveGame("quiz")
        setIsCreating(false)
        setTopic("")
        setPdfContent("")
      }
    } catch (error) {
      console.error("Failed to create quiz:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFlashcards = async () => {
    if (!topic && sourceType === "topic") return
    if (!pdfContent && sourceType === "pdf") return

    setLoading(true)
    try {
      const res = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          content: pdfContent,
          sourceType,
          difficulty,
          cardCount: 15,
        }),
      })

      const data = await res.json()
      if (data.flashcardSet) {
        setLocalFlashcards([data.flashcardSet, ...localFlashcards])
        setSelectedFlashcards(data.flashcardSet)
        setActiveGame("flashcards")
        setIsCreating(false)
        setTopic("")
        setPdfContent("")
      }
    } catch (error) {
      console.error("Failed to create flashcards:", error)
    } finally {
      setLoading(false)
    }
  }

  // Render active game
  if (activeGame === "quiz" && selectedQuiz) {
    return (
      <QuizGame
        quiz={selectedQuiz}
        onBack={() => {
          setActiveGame(null)
          setSelectedQuiz(null)
        }}
      />
    )
  }

  if (activeGame === "speed" && selectedQuiz) {
    return (
      <SpeedQuiz
        quiz={selectedQuiz}
        onBack={() => {
          setActiveGame(null)
          setSelectedQuiz(null)
        }}
      />
    )
  }

  if (activeGame === "flashcards" && selectedFlashcards) {
    return (
      <FlashcardGame
        flashcardSet={selectedFlashcards}
        onBack={() => {
          setActiveGame(null)
          setSelectedFlashcards(null)
        }}
      />
    )
  }

  if (activeGame === "word-match" && selectedFlashcards) {
    return (
      <WordMatchGame
        flashcardSet={selectedFlashcards}
        onBack={() => {
          setActiveGame(null)
          setSelectedFlashcards(null)
        }}
      />
    )
  }

  if (activeGame === "memory-match" && selectedFlashcards) {
    return (
      <MemoryMatchGame
        flashcardSet={selectedFlashcards}
        onBack={() => {
          setActiveGame(null)
          setSelectedFlashcards(null)
        }}
      />
    )
  }

  if (activeGame === "fill-blanks" && selectedQuiz) {
    return (
      <FillBlanksGame
        quiz={selectedQuiz}
        onBack={() => {
          setActiveGame(null)
          setSelectedQuiz(null)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/chat">
              <Button variant="ghost" size="icon" className="text-primary">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Study Games</h1>
              <p className="text-muted-foreground">Learn through fun quizzes and games</p>
            </div>
          </div>
        </div>

        {/* Create New Section */}
        {isCreating ? (
          <Card className="border-primary/30 bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Create {createType === "quiz" ? "Quiz" : "Flashcards"}</CardTitle>
              <CardDescription>
                Generate AI-powered {createType === "quiz" ? "quiz questions" : "flashcards"} from a topic or your notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={sourceType === "topic" ? "default" : "outline"}
                  onClick={() => setSourceType("topic")}
                  className="flex-1"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  From Topic
                </Button>
                <Button
                  variant={sourceType === "pdf" ? "default" : "outline"}
                  onClick={() => setSourceType("pdf")}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  From Notes
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="bg-input">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{level.label}</span>
                          <span className="text-xs text-muted-foreground">{level.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {sourceType === "topic" ? (
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Photosynthesis, World War II, Algebra basics"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-input"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="notes">Paste your notes or study material</Label>
                  <Textarea
                    id="notes"
                    placeholder="Paste your notes, textbook content, or any study material here..."
                    value={pdfContent}
                    onChange={(e) => setPdfContent(e.target.value)}
                    className="bg-input min-h-[200px]"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={createType === "quiz" ? handleCreateQuiz : handleCreateFlashcards}
                  disabled={loading || (sourceType === "topic" ? !topic : !pdfContent)}
                  className="flex-1"
                >
                  {loading ? "Generating..." : `Create ${createType === "quiz" ? "Quiz" : "Flashcards"}`}
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className="border-primary/30 bg-card hover:border-primary/60 cursor-pointer transition-colors"
              onClick={() => {
                setIsCreating(true)
                setCreateType("quiz")
              }}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-full bg-primary/20">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Create New Quiz</h3>
                  <p className="text-sm text-muted-foreground">Generate AI-powered quiz questions</p>
                </div>
              </CardContent>
            </Card>
            <Card
              className="border-accent/30 bg-card hover:border-accent/60 cursor-pointer transition-colors"
              onClick={() => {
                setIsCreating(true)
                setCreateType("flashcards")
              }}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-full bg-accent/20">
                  <Plus className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Create Flashcards</h3>
                  <p className="text-sm text-muted-foreground">Generate flashcards for memorization</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game Modes */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary">
            <TabsTrigger
              value="quizzes"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Brain className="h-4 w-4 mr-2" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger
              value="flashcards"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="h-4 w-4 mr-2" />
              Flashcards
            </TabsTrigger>
            <TabsTrigger
              value="fun-games"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Gamepad2 className="h-4 w-4 mr-2" />
              Fun Games
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quizzes" className="space-y-4 mt-6">
            {localQuizzes.length === 0 ? (
              <Card className="border-dashed border-muted bg-card/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No quizzes yet. Create your first quiz to get started!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {localQuizzes.map((quiz) => (
                  <Card key={quiz.id} className="border-primary/20 bg-card hover:border-primary/40 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-foreground">{quiz.title}</CardTitle>
                        {quiz.difficulty && (
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary capitalize">
                            {quiz.difficulty}
                          </span>
                        )}
                      </div>
                      <CardDescription>{quiz.questions?.length || 0} questions</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => {
                          setSelectedQuiz(quiz)
                          setActiveGame("quiz")
                        }}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Practice
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => {
                          setSelectedQuiz(quiz)
                          setActiveGame("speed")
                        }}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Speed Quiz
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="flashcards" className="space-y-4 mt-6">
            {localFlashcards.length === 0 ? (
              <Card className="border-dashed border-muted bg-card/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No flashcard sets yet. Create your first set to get started!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {localFlashcards.map((set) => (
                  <Card key={set.id} className="border-accent/20 bg-card hover:border-accent/40 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-foreground">{set.title}</CardTitle>
                      <CardDescription>{set.cards?.length || 0} cards</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => {
                          setSelectedFlashcards(set)
                          setActiveGame("flashcards")
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Study Cards
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="fun-games" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Word Match Game */}
              <Card className="border-green-500/30 bg-card hover:border-green-500/60 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <Puzzle className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">Word Match</CardTitle>
                      <CardDescription>Match terms with definitions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop to match terms with their correct definitions. Race against time!
                  </p>
                  {localFlashcards.length > 0 ? (
                    <Select
                      onValueChange={(value) => {
                        const set = localFlashcards.find((s) => s.id === value)
                        if (set) {
                          setSelectedFlashcards(set)
                          setActiveGame("word-match")
                        }
                      }}
                    >
                      <SelectTrigger className="bg-input">
                        <SelectValue placeholder="Select a flashcard set" />
                      </SelectTrigger>
                      <SelectContent>
                        {localFlashcards.map((set) => (
                          <SelectItem key={set.id} value={set.id}>
                            {set.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Create flashcards to play this game
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Memory Match Game */}
              <Card className="border-purple-500/30 bg-card hover:border-purple-500/60 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Target className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">Memory Match</CardTitle>
                      <CardDescription>Find matching pairs</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Flip cards to find matching term-definition pairs. Test your memory!
                  </p>
                  {localFlashcards.length > 0 ? (
                    <Select
                      onValueChange={(value) => {
                        const set = localFlashcards.find((s) => s.id === value)
                        if (set) {
                          setSelectedFlashcards(set)
                          setActiveGame("memory-match")
                        }
                      }}
                    >
                      <SelectTrigger className="bg-input">
                        <SelectValue placeholder="Select a flashcard set" />
                      </SelectTrigger>
                      <SelectContent>
                        {localFlashcards.map((set) => (
                          <SelectItem key={set.id} value={set.id}>
                            {set.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Create flashcards to play this game
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Fill in the Blanks Game */}
              <Card className="border-orange-500/30 bg-card hover:border-orange-500/60 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/20">
                      <Sparkles className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">Fill Blanks</CardTitle>
                      <CardDescription>Complete the sentences</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Type the missing words to complete sentences from quiz questions.
                  </p>
                  {localQuizzes.length > 0 ? (
                    <Select
                      onValueChange={(value) => {
                        const quiz = localQuizzes.find((q) => q.id === value)
                        if (quiz) {
                          setSelectedQuiz(quiz)
                          setActiveGame("fill-blanks")
                        }
                      }}
                    >
                      <SelectTrigger className="bg-input">
                        <SelectValue placeholder="Select a quiz" />
                      </SelectTrigger>
                      <SelectContent>
                        {localQuizzes.map((quiz) => (
                          <SelectItem key={quiz.id} value={quiz.id}>
                            {quiz.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">Create a quiz to play this game</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Tips */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Learning Tips
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    <p>Start with Basic difficulty and work your way up as you master concepts.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <p>Play Memory Match to strengthen recall and pattern recognition.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <p>Use Speed Quiz mode to test yourself under pressure before exams.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            <Card className="border-primary/20 bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Your Top Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topScores.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Play some games to see your scores here!</p>
                ) : (
                  <div className="space-y-3">
                    {topScores.map((score, index) => (
                      <div key={score.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-primary">#{index + 1}</span>
                          <div>
                            <p className="font-medium text-foreground capitalize">
                              {score.game_type.replace(/_/g, " ")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(score.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">{score.score}</p>
                          {score.streak > 0 && <p className="text-sm text-accent">{score.streak} streak</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

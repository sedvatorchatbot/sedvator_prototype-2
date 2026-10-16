"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, CheckCircle, XCircle, Sparkles, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Question { question: string; options: string[]; correctIndex: number; explanation?: string }
interface Quiz { id: string; title: string; questions: Question[] }
interface BlankQuestion { sentence: string; blankedWords: string[]; hint: string }

export function FillBlanksGame({ quiz, onBack }: { quiz: Quiz; onBack: () => void }) {
  const [state, setState] = useState<"ready" | "playing" | "complete">("ready")
  const [questions, setQuestions] = useState<BlankQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [result, setResult] = useState<boolean | null>(null)
  const [startTime, setStartTime] = useState(0)

  function createQuestions() {
    return quiz.questions.flatMap((q) => {
      const answer = q.options[q.correctIndex]?.trim()
      if (!answer) return []
      const words = answer.split(/\s+/).map((word) => word.replace(/[^a-zA-Z0-9-]/g, "")).filter((word) => word.length >= 3)
      const chosen = words.slice(0, Math.min(3, words.length))
      if (chosen.length === 0) return []
      let cursor = 0
      const sentence = words.map((word) => chosen.includes(word) && cursor < chosen.length ? (cursor++, "_____ ".trim()) : word).join(" ")
      return [{ sentence: `${q.question} ${sentence}`, blankedWords: chosen.map((word) => word.toLowerCase()), hint: `A vague clue: ${q.explanation?.replace(/^the correct answer is:?\s*/i, "").slice(0, 180) || "A key idea or term connected to this question."}` }]
    }).slice(0, 8)
  }
  useEffect(() => { if (state === "playing") { setQuestions(createQuestions()); setIndex(0); setAnswers([]); setScore(0); setResult(null); setStartTime(Date.now()) } }, [state])
  const current = questions[index]
  function submit() { const correct = current.blankedWords.every((word, i) => answers[i]?.trim().toLowerCase().replace(/[^a-z0-9]/g, "") === word.replace(/[^a-z0-9]/g, "")); setResult(correct); if (correct) setScore((value) => value + 1) }
  function next() { if (index < questions.length - 1) { setIndex((value) => value + 1); setAnswers([]); setResult(null) } else { setState("complete"); fetch("/api/game/score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gameType: "fill_blanks", score: Math.round(((score + (result ? 1 : 0)) / questions.length) * 100), timeTaken: Math.floor((Date.now() - startTime) / 1000), streak: score, metadata: { quizId: quiz.id } }) }).catch(() => undefined) } }
  if (state === "ready") return <div className="min-h-screen bg-background p-4 flex items-center justify-center"><Card className="w-full max-w-lg"><CardContent className="space-y-5 pt-8 text-center"><Sparkles className="mx-auto h-12 w-12 text-orange-500" /><h2 className="text-2xl font-bold">Fill in the Blanks</h2><p className="text-muted-foreground">Complete 1–3 context-based terms. Each answer has its own letter boxes.</p><Button className="w-full" onClick={() => setState("playing")}>Start Game</Button><Button variant="ghost" className="w-full" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button></CardContent></Card></div>
  if (state === "complete" || !current) return <div className="min-h-screen bg-background p-4 flex items-center justify-center"><Card className="w-full max-w-lg"><CardContent className="space-y-5 pt-8 text-center"><Trophy className="mx-auto h-12 w-12 text-orange-500" /><h2 className="text-2xl font-bold">Game Complete</h2><p className="text-xl">{score} / {questions.length} correct</p><Button className="w-full" onClick={() => setState("ready")}>Play Again</Button><Button variant="ghost" className="w-full" onClick={onBack}>Back to Games</Button></CardContent></Card></div>
  return <div className="min-h-screen bg-background p-4 md:p-8"><div className="mx-auto max-w-2xl space-y-5"><div className="flex items-center justify-between"><Button variant="ghost" size="icon" onClick={onBack} aria-label="Back"><ArrowLeft /></Button><p className="text-sm text-muted-foreground">Question {index + 1} of {questions.length}</p><p className="font-bold">{score} <span className="text-xs font-normal text-muted-foreground">Score</span></p></div><Progress value={((index + 1) / questions.length) * 100} /><Card className="border-orange-500/30"><CardHeader><CardTitle>Complete the sentence</CardTitle></CardHeader><CardContent className="space-y-5"><p className="text-xl leading-relaxed">{current.sentence}</p><div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3 text-sm"><span className="font-semibold text-orange-500">Hint: </span>{current.hint}</div>{result === null ? <div className="space-y-4">{current.blankedWords.map((word, wordIndex) => <div key={wordIndex} className="space-y-2"><p className="text-sm font-medium text-muted-foreground">Blank {wordIndex + 1} <span className="text-xs">({word.length} letters)</span></p><div className="flex gap-1">{Array.from({ length: word.length }).map((_, letterIndex) => <span key={letterIndex} className="h-8 w-8 rounded border border-border bg-muted text-center leading-8 text-transparent">_</span>)}</div><Input aria-label={`Blank ${wordIndex + 1}`} value={answers[wordIndex] || ""} maxLength={word.length} onChange={(event) => setAnswers((values) => values.map((value, i) => i === wordIndex ? event.target.value : value).concat(values.length <= wordIndex ? [event.target.value] : []).slice(0, current.blankedWords.length))} placeholder={`Enter ${word.length} letters`} /></div>)}<Button className="w-full" disabled={answers.some((answer) => !answer?.trim())} onClick={submit}>Check Answer</Button></div> : <div className="space-y-4"><div className={cn("flex items-center gap-3 rounded-lg border p-4", result ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10")}>{result ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}<div><p className="font-medium">{result ? "Correct!" : "Not quite"}</p>{!result && <p className="text-sm text-muted-foreground">Answers: {current.blankedWords.join(", ")}</p>}</div></div><Button className="w-full" onClick={next}>{index < questions.length - 1 ? "Next Question" : "See Results"}</Button></div>}</CardContent></Card></div></div>
}

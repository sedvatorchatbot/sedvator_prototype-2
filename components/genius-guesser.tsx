"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, Brain, Check, Delete, Loader2, RotateCcw, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FlashcardSet { id: string; title: string; topic: string; cards: { term: string; definition: string }[] }
type LetterState = "correct" | "present" | "absent" | "empty"
const KEYBOARD = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"]

function normalize(value: string) { return value.toLowerCase().replace(/[^a-z]/g, "") }
function evaluate(guess: string, answer: string): LetterState[] {
  const states: LetterState[] = Array(answer.length).fill("absent")
  const remaining = answer.split("")
  guess.split("").forEach((letter, index) => {
    if (letter === answer[index]) { states[index] = "correct"; remaining[index] = "" }
  })
  guess.split("").forEach((letter, index) => {
    if (states[index] === "correct") return
    const match = remaining.indexOf(letter)
    if (match >= 0) { states[index] = "present"; remaining[match] = "" }
  })
  return states
}

export function GeniusGuesser({ flashcardSet, onBack }: { flashcardSet: FlashcardSet; onBack: () => void }) {
  const [answer, setAnswer] = useState("")
  const [guesses, setGuesses] = useState<string[]>([])
  const [current, setCurrent] = useState("")
  const [message, setMessage] = useState("")
  const [complete, setComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const scoreSaved = useRef(false)
  const maxAttempts = 7

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setAnswer("")
    setGuesses([])
    setCurrent("")
    setComplete(false)
    setMessage("")
    scoreSaved.current = false
    fetch("/api/genius-guesser/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: flashcardSet.topic || flashcardSet.title, cards: flashcardSet.cards }),
    }).then(async (response) => {
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not generate a word")
      if (!cancelled) setAnswer(normalize(data.answer))
    }).catch((error) => {
      if (!cancelled) setMessage(error instanceof Error ? error.message : "Could not generate a word")
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [flashcardSet])

  const saveScore = async (didWin: boolean, attempts: number) => {
    if (scoreSaved.current) return
    scoreSaved.current = true
    try {
      await fetch("/api/game/score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        gameType: "genius_guesser", score: didWin ? Math.max(10, (maxAttempts - attempts + 1) * 15) : 0,
        streak: didWin ? 1 : 0, timeTaken: 0, metadata: { topic: flashcardSet.topic || flashcardSet.title, wordLength: answer.length },
      }) })
    } catch (error) { console.error("[v0] Failed to save Genius Guesser score", error) }
  }
  const keyboardStates = useMemo(() => {
    const map: Record<string, LetterState> = {}
    guesses.forEach((guess) => evaluate(guess, answer).forEach((state, index) => {
      const letter = guess[index]
      if (state === "correct" || (state === "present" && map[letter] !== "correct")) map[letter] = state
      else if (!map[letter]) map[letter] = state
    }))
    return map
  }, [guesses, answer])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (complete || loading || !answer) return
      if (/^[a-zA-Z]$/.test(event.key)) setCurrent((value) => value.length < answer.length ? value + event.key.toLowerCase() : value)
      if (event.key === "Backspace") setCurrent((value) => value.slice(0, -1))
      if (event.key === "Enter") submitGuess()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  function submitGuess() {
    if (loading || !answer) return
    if (current.length !== answer.length) { setMessage(`Enter a ${answer.length}-letter word.`); return }
    if (guesses.includes(current)) { setMessage("You already tried that word."); return }
    const next = [...guesses, current]
    setGuesses(next); setCurrent("")
    if (current === answer) { setMessage("Genius! You found the word."); setComplete(true); void saveScore(true, next.length) }
    else if (next.length >= maxAttempts) { setMessage(`The word was ${answer.toUpperCase()}.`); setComplete(true); void saveScore(false, next.length) }
    else setMessage("")
  }

  if (loading || !answer) return <div className="min-h-screen bg-background p-4 md:p-8"><div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center"><Card className="w-full"><CardContent className="flex flex-col items-center gap-3 py-12 text-center"><Loader2 className="h-8 w-8 animate-spin text-cyan-500" /><p className="text-muted-foreground">Generating a challenging {flashcardSet.topic || flashcardSet.title} word...</p>{message && <p role="alert" className="text-sm text-destructive">{message}</p>}</CardContent></Card></div></div>

  return <div className="min-h-screen bg-background p-4 md:p-8"><div className="mx-auto max-w-xl space-y-5">
    <div className="flex items-center justify-between"><Button variant="ghost" size="icon" onClick={onBack} aria-label="Back"><ArrowLeft /></Button><div className="text-center"><h1 className="text-2xl font-bold">Genius Guesser</h1><p className="text-sm text-muted-foreground">{flashcardSet.topic || flashcardSet.title}</p></div><div className="text-right"><p className="font-bold">{guesses.length}/{maxAttempts}</p><p className="text-xs text-muted-foreground">Guesses</p></div></div>
    <Card className="border-cyan-500/30"><CardContent className="space-y-5 pt-6"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Brain className="h-4 w-4 text-cyan-500" />Guess the topic word in seven tries.</div>
      <div className="mx-auto grid max-w-[360px] gap-1.5" style={{ gridTemplateRows: `repeat(${maxAttempts}, minmax(0, 1fr))` }}>{Array.from({ length: maxAttempts }).map((_, row) => { const guess = guesses[row] || (row === guesses.length && !complete ? current : ""); const states = guesses[row] ? evaluate(guesses[row], answer) : []; return <div key={row} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${answer.length}, minmax(0, 1fr))` }}>{Array.from({ length: answer.length }).map((__, index) => <div key={index} className={cn("flex aspect-square items-center justify-center rounded border-2 text-xl font-bold uppercase", states[index] === "correct" && "border-green-600 bg-green-600 text-white", states[index] === "present" && "border-yellow-500 bg-yellow-500 text-white", states[index] === "absent" && "border-zinc-700 bg-zinc-700 text-white", !states[index] && guess[index] && "border-foreground")}>{guess[index] || ""}</div>)}</div> })}</div>
      {message && <p role="status" className="text-center text-sm font-medium">{message}</p>}
      <div className="space-y-1.5">{KEYBOARD.map((row) => <div key={row} className="flex justify-center gap-1.5">{row.split("").map((letter) => <Button key={letter} type="button" variant="outline" className={cn("h-10 min-w-8 px-2 font-bold", keyboardStates[letter.toLowerCase()] === "correct" && "bg-green-600 text-white hover:bg-green-600", keyboardStates[letter.toLowerCase()] === "present" && "bg-yellow-500 text-white hover:bg-yellow-500", keyboardStates[letter.toLowerCase()] === "absent" && "bg-zinc-700 text-white hover:bg-zinc-700")} onClick={() => !complete && setCurrent((value) => value.length < answer.length ? value + letter.toLowerCase() : value)}>{letter}</Button>)}</div>)}<div className="flex justify-center gap-2"><Button variant="outline" onClick={() => setCurrent((value) => value.slice(0, -1))}><Delete className="mr-1 h-4 w-4" />Delete</Button><Button onClick={submitGuess} disabled={complete}><Check className="mr-1 h-4 w-4" />Enter</Button></div></div>
      {complete && <Button variant="outline" className="w-full" onClick={() => { setGuesses([]); setCurrent(""); setMessage(""); setComplete(false) }}><RotateCcw className="mr-2 h-4 w-4" />Play Again</Button>}
    </CardContent></Card>
  </div></div>
}

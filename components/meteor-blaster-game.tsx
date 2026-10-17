"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, Crosshair, Flame, Heart, Rocket, Send, Timer, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const difficultyConfig = {
  easy: { label: "EASY", color: "#66e0d0", speed: 0.018, spawn: 2600, max: 2, lives: 5 },
  medium: { label: "MEDIUM", color: "#ffd166", speed: 0.026, spawn: 1900, max: 4, lives: 4 },
  hard: { label: "HARD", color: "#ff6b4a", speed: 0.036, spawn: 1300, max: 6, lives: 3 },
} as const

type Difficulty = keyof typeof difficultyConfig
type Mode = "campaign" | "endless" | "practice"
type Meteor = { id: number; question: string; answer: string; scrambled: string; x: number; y: number; size: number; rotation: number; born: number }

const questionSeeds = [
  ["Which keyword declares an integer variable?", "int"],
  ["What does CPU stand for?", "central processing unit"],
  ["What is 3 × 4?", "12"],
  ["What gas do plants absorb?", "carbon dioxide"],
  ["What is the derivative of x²?", "2x"],
  ["What does HTML stand for?", "hypertext markup language"],
]

function scramble(answer: string, id: number) {
  const compact = answer.toUpperCase().replace(/[^A-Z0-9 ]/g, "")
  if (compact.length < 3) return compact.split("").reverse().join("")
  const chars = compact.split("")
  const offset = (id % (chars.length - 1)) + 1
  return chars.slice(offset).concat(chars.slice(0, offset)).join("")
}

function cleanGameText(value: string) {
  return value
    .replace(/[`*_~\\/]+/g, "")
    .replace(/\s*[-–—]\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function normalize(value: string) { return value.toLowerCase().replace(/[^a-z0-9]/g, "") }

export function MeteorBlasterGame({ onBack, onScoreSaved }: { onBack: () => void; onScoreSaved?: (score: number, streak: number) => void }) {
  const [phase, setPhase] = useState<"setup" | "playing" | "over">("setup")
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [mode, setMode] = useState<Mode>("campaign")
  const [meteors, setMeteors] = useState<Meteor[]>([])
  const [answer, setAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [lives, setLives] = useState(4)
  const [elapsed, setElapsed] = useState(0)
  const [flash, setFlash] = useState<number | null>(null)
  const nextId = useRef(0)
  const startedAt = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const scoreSaved = useRef(false)
  const config = difficultyConfig[difficulty]

  const createMeteor = useCallback(() => {
    const id = nextId.current++
    const [baseQuestion, baseAnswer] = questionSeeds[id % questionSeeds.length]
    setMeteors(current => current.length >= config.max ? current : [...current, { id, question: topic ? `${baseQuestion} (${cleanGameText(topic)})` : baseQuestion, answer: cleanGameText(baseAnswer), scrambled: scramble(baseAnswer, id), x: 8 + ((id * 37) % 82), y: -10, size: 68 + ((id * 17) % 30), rotation: -12 + ((id * 23) % 24), born: performance.now() }])
  }, [config.max, topic])

  const startGame = () => { scoreSaved.current = false; setPhase("playing"); setScore(0); setCombo(0); setLives(config.lives); setElapsed(0); setMeteors([]); nextId.current = 0; startedAt.current = performance.now(); setTimeout(createMeteor, 300); inputRef.current?.focus() }

  useEffect(() => {
    if (phase !== "playing") return
    const tick = window.setInterval(() => {
      const now = performance.now()
      setElapsed(Math.floor((now - startedAt.current) / 1000))
      setMeteors(current => current.flatMap(meteor => {
        const nextY = meteor.y + config.speed * 1.8
        if (nextY > 87) { setLives(value => { const next = value - 1; if (next <= 1) setPhase("over"); return next }); setCombo(0); setFlash(meteor.id); window.setTimeout(() => setFlash(null), 250); return [] }
        return [{ ...meteor, y: nextY, rotation: meteor.rotation + 0.12 }]
      }))
    }, 50)
    const spawner = window.setInterval(createMeteor, config.spawn)
    return () => { clearInterval(tick); clearInterval(spawner) }
  }, [config.spawn, config.speed, phase, createMeteor])

  const saveScore = useCallback(async (finalScore: number, finalStreak: number) => {
    try {
      const response = await fetch("/api/game/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType: "meteor_blaster", score: finalScore, streak: finalStreak, timeTaken: elapsed, metadata: { topic, difficulty, mode } }),
      })
      if (!response.ok) throw new Error("Score save failed")
      onScoreSaved?.(finalScore, finalStreak)
    } catch (error) {
      console.error("[v0] Failed to save Meteor Blaster score", error)
    }
  }, [difficulty, elapsed, mode, onScoreSaved, topic])

  const submitAnswer = () => {
    const value = normalize(answer)
    if (!value || phase !== "playing") return
    const target = meteors.find(meteor => normalize(meteor.answer) === value)
    if (!target) { setCombo(0); setAnswer(""); return }
    setMeteors(current => current.filter(meteor => meteor.id !== target.id))
    setScore(currentScore => currentScore + value.length * 10 + combo * 25); setCombo(combo + 1); setFlash(target.id); setAnswer(""); window.setTimeout(() => setFlash(null), 350); inputRef.current?.focus()
  }

  const stars = useMemo(() => Array.from({ length: 60 }, (_, index) => ({ left: `${(index * 47) % 100}%`, top: `${(index * 29) % 82}%`, delay: `${index % 7}s` })), [])

  useEffect(() => {
    if (phase === "over" && !scoreSaved.current) {
      scoreSaved.current = true
      void saveScore(score, combo)
    }
  }, [combo, phase, saveScore, score])

  if (phase === "setup" || phase === "over") return <main className="min-h-screen bg-[#08111f] px-4 py-6 text-[#e9f4e8]" style={{ fontFamily: "monospace" }}><div className="mx-auto max-w-5xl"><Button variant="ghost" onClick={onBack} className="mb-5 text-[#7de2d2] hover:bg-[#12243a]"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Games</Button><section className="relative overflow-hidden rounded-[2px] border-4 border-[#304b63] bg-[#0d1c2d] p-6 shadow-[8px_8px_0_#050a12] md:p-10">{stars.map((star, i) => <i key={i} className="absolute h-1 w-1 bg-[#dff8ec] opacity-70 animate-[twinkle_2.4s_ease-in-out_infinite]" style={star} />)}<div className="relative z-10 mx-auto max-w-2xl text-center"><div className="mb-5 inline-flex items-center gap-2 border-2 border-[#ff765d] bg-[#261b27] px-3 py-2 text-xs tracking-[0.35em] text-[#ff9c7b]"><Rocket className="h-4 w-4" /> METEOR BLASTER</div><h1 className="mb-2 text-4xl font-black tracking-tight text-[#ffd166] md:text-6xl" style={{ textShadow: "4px 4px #b54543" }}>WORD DEFENSE</h1><p className="mb-8 text-sm text-[#91aab6]">Type the scrambled answer before the question reaches the horizon.</p>{phase === "over" && <div className="mb-5 border-2 border-[#ff765d] bg-[#3a202a] p-3 text-[#ffac8c]">DEFENSE BREACHED — SCORE {score}</div>}<label className="mb-2 block text-left text-xs tracking-[0.2em] text-[#7de2d2]">ENTER YOUR TOPIC</label><Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. C pointers, photosynthesis, calculus" className="mb-6 h-12 rounded-none border-2 border-[#426179] bg-[#071321] text-[#e9f4e8] placeholder:text-[#5e7787]" /><div className="mb-7 grid gap-5 text-left md:grid-cols-2"><div><span className="mb-2 block text-xs tracking-[0.2em] text-[#7de2d2]">DIFFICULTY</span><div className="grid grid-cols-3 gap-2">{(Object.keys(difficultyConfig) as Difficulty[]).map(level => <button key={level} onClick={() => setDifficulty(level)} className={`border-2 px-2 py-3 text-xs font-bold ${difficulty === level ? "border-[#ffd166] bg-[#4a3920] text-[#ffd166]" : "border-[#304b63] bg-[#101f30] text-[#91aab6]"}`}>{difficultyConfig[level].label}</button>)}</div></div><div><span className="mb-2 block text-xs tracking-[0.2em] text-[#7de2d2]">GAME MODE</span><div className="grid grid-cols-3 gap-2">{(["campaign", "endless", "practice"] as Mode[]).map(item => <button key={item} onClick={() => setMode(item)} className={`border-2 px-2 py-3 text-xs font-bold ${mode === item ? "border-[#7de2d2] bg-[#18383b] text-[#7de2d2]" : "border-[#304b63] bg-[#101f30] text-[#91aab6]"}`}>{item.toUpperCase()}</button>)}</div></div></div><Button onClick={startGame} className="h-14 w-full rounded-none border-4 border-[#ffd166] bg-[#e25745] text-lg font-black tracking-[0.2em] text-white shadow-[5px_5px_0_#7b2c35] hover:bg-[#f06b4c]">START MISSION <Flame className="ml-2 h-5 w-5" /></Button></div></section></div></main>

  return <main className="min-h-screen bg-[#08111f] text-[#e9f4e8]" style={{ fontFamily: "monospace" }}><header className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-[#304b63] bg-[#0b1726] px-4 py-3"><Button variant="ghost" onClick={onBack} className="text-[#7de2d2] hover:bg-[#15273a]"><ArrowLeft className="mr-2 h-4 w-4" /> Exit</Button><div className="flex items-center gap-5 text-xs font-bold tracking-widest"><span className="text-[#ffd166]">SCORE {score}</span><span className="text-[#ff9c7b]">COMBO x{combo}</span><span className="text-[#7de2d2]"><Timer className="mr-1 inline h-4 w-4" />{String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}</span></div></header><section className="mx-auto max-w-6xl p-3 md:p-6"><div className="relative h-[620px] overflow-hidden border-4 border-[#304b63] bg-[#08111f] shadow-[8px_8px_0_#050a12]">{stars.map((star, i) => <i key={i} className="absolute h-1 w-1 bg-[#dff8ec] opacity-70 animate-[twinkle_2.4s_ease-in-out_infinite]" style={star} />)}<div className="absolute -right-20 -top-16 h-72 w-72 rounded-full border-[18px] border-[#254c63] bg-[#123e6a] opacity-70" /><div className="absolute -bottom-14 left-0 h-32 w-full bg-[#533b32]" style={{ clipPath: "polygon(0 68%, 5% 42%, 10% 70%, 18% 30%, 27% 72%, 36% 46%, 45% 78%, 55% 33%, 65% 69%, 74% 42%, 84% 73%, 93% 38%, 100% 67%, 100% 100%, 0 100%)" }} /><div className="absolute bottom-0 left-0 right-0 h-5 border-t-4 border-[#c25c3e] bg-[#2e2529]" />{meteors.map(meteor => <div key={meteor.id} className={`absolute -translate-x-1/2 transition-transform ${flash === meteor.id ? "animate-ping" : ""}`} style={{ left: `${meteor.x}%`, top: `${meteor.y}%`, transform: `translateX(-50%) rotate(${meteor.rotation}deg)` }}><div className="relative flex items-center justify-center rounded-[38%_62%_58%_42%] border-4 border-[#d85d40] bg-[#75453b] shadow-[inset_8px_5px_0_#a85a42,inset_-8px_-7px_0_#3d2f32,0_0_18px_#dc6547]" style={{ width: meteor.size, height: meteor.size }}><div className="absolute inset-2 flex items-center justify-center rounded-sm border-2 border-[#ffd166] bg-[#241e2a]/95 p-1 text-center text-[9px] font-bold leading-tight text-[#fff0b5]">{meteor.question}</div><span className="absolute -bottom-7 whitespace-nowrap bg-[#102537] px-2 py-1 text-[10px] text-[#ffb872]">TARGET {meteor.id + 1} • {meteor.scrambled}</span></div></div>)}<div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center"><div className="mb-2 flex items-center gap-2 text-xs text-[#91aab6]"><Crosshair className="h-4 w-4 text-[#ff765d]" /> ACTIVE TARGETS: {meteors.length}</div><div className="relative h-24 w-20"><div className="absolute bottom-0 left-1/2 h-20 w-8 -translate-x-1/2 border-4 border-[#d7d7c5] bg-[#5d7380] shadow-[5px_5px_0_#202a38]" /><div className="absolute bottom-12 left-1/2 h-16 w-5 -translate-x-1/2 -rotate-0 border-4 border-[#ff765d] bg-[#ffd166]" /><div className="absolute bottom-0 left-1/2 h-5 w-12 -translate-x-1/2 bg-[#303c49]" /></div><div className="flex items-center gap-2 text-xs text-[#ffd166]"><Heart className="h-4 w-4 fill-current text-[#ff765d]" /> {Array.from({ length: lives }).map((_, i) => <span key={i}>♥</span>)}</div></div></div><div className="mx-auto mt-4 flex max-w-2xl gap-2 border-4 border-[#304b63] bg-[#0d1c2d] p-2"><Input ref={inputRef} autoFocus value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) submitAnswer() }} placeholder="TYPE ANSWER — PRESS ENTER TO FIRE" className="h-12 rounded-none border-2 border-[#426179] bg-[#071321] font-bold tracking-wider text-[#ffd166]" /><Button onClick={submitAnswer} className="h-12 rounded-none bg-[#e25745] px-5 hover:bg-[#f06b4c]" aria-label="Fire rocket"><Send className="h-5 w-5" /></Button></div><p className="mt-3 text-center text-xs text-[#6e8794]">{topic || "General study mode"} • {config.label} • {mode.toUpperCase()} <Zap className="ml-1 inline h-3 w-3 text-[#ffd166]" /></p></section></main>
}

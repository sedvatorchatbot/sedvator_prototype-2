"use client"

import type React from "react"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RoutineCard } from "@/components/routine-card"
import { ReminderModal } from "@/components/reminder-modal"
import { ArrowLeft, Plus, Bell, Calendar, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"

interface Profile {
  id: string
  grade: string | null
  subjects: string[] | null
}

interface StudyRoutine {
  id: string
  title: string
  schedule: {
    weeklySchedule: {
      day: string
      sessions: {
        time: string
        subject: string
        activity: string
        duration: number
      }[]
    }[]
    tips: string[]
  }
  created_at: string
}

interface Reminder {
  id: string
  title: string
  time: string
  days: string[]
  enabled: boolean
}

export function RoutineDashboard({
  user,
  profile,
  initialRoutines,
  initialReminders,
}: {
  user: User
  profile: Profile | null
  initialRoutines: StudyRoutine[]
  initialReminders: Reminder[]
}) {
  const [routines, setRoutines] = useState<StudyRoutine[]>(initialRoutines)
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders)
  const [showGenerator, setShowGenerator] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Generator form state
  const [goal, setGoal] = useState("")
  const [availableHours, setAvailableHours] = useState("2")
  const [daysPerWeek, setDaysPerWeek] = useState("5")

  const generateRoutine = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goal.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          grade: profile?.grade || "High School",
          subjects: profile?.subjects || ["General Studies"],
          availableHours: Number.parseInt(availableHours),
          daysPerWeek: Number.parseInt(daysPerWeek),
        }),
      })

      const data = await response.json()

      if (data.routine) {
        // Save to database
        const supabase = createClient()
        const { data: savedRoutine, error } = await supabase
          .from("study_routines")
          .insert({
            user_id: user.id,
            title: data.routine.title || `Study Plan for ${goal}`,
            schedule: data.routine,
          })
          .select()
          .single()

        if (!error && savedRoutine) {
          setRoutines((prev) => [savedRoutine as StudyRoutine, ...prev])
        }

        setShowGenerator(false)
        setGoal("")
      }
    } catch (error) {
      console.error("Failed to generate routine:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const deleteRoutine = async (id: string) => {
    const supabase = createClient()
    await supabase.from("study_routines").delete().eq("id", id)
    setRoutines((prev) => prev.filter((r) => r.id !== id))
  }

  const saveReminder = async (reminder: Omit<Reminder, "id">) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("reminders")
      .insert({
        user_id: user.id,
        ...reminder,
      })
      .select()
      .single()

    if (!error && data) {
      setReminders((prev) => [data as Reminder, ...prev])

      // Request notification permission
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission()
      }
    }

    setShowReminderModal(false)
  }

  const toggleReminder = async (id: string, enabled: boolean) => {
    const supabase = createClient()
    await supabase.from("reminders").update({ enabled }).eq("id", id)
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, enabled } : r)))
  }

  const deleteReminder = async (id: string) => {
    const supabase = createClient()
    await supabase.from("reminders").delete().eq("id", id)
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold text-foreground">Study Routines</h1>
            <p className="text-xs text-muted-foreground">Plan your learning journey</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReminderModal(true)}
            className="border-border text-muted-foreground hover:text-foreground bg-transparent"
          >
            <Bell className="w-4 h-4 mr-2" />
            Reminder
          </Button>
          <Button
            size="sm"
            onClick={() => setShowGenerator(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Routine
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Active Reminders */}
        {reminders.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyan-400" />
              Your Reminders
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${reminder.enabled ? "bg-cyan-500/20 text-cyan-400" : "bg-muted text-muted-foreground"}`}
                    >
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{reminder.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {reminder.time} • {reminder.days.join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReminder(reminder.id, !reminder.enabled)}
                      className={reminder.enabled ? "text-cyan-400" : "text-muted-foreground"}
                    >
                      {reminder.enabled ? "On" : "Off"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteReminder(reminder.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Routine Generator Form */}
        {showGenerator && (
          <section className="mb-8">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Generate Study Routine</h2>
                  <p className="text-sm text-muted-foreground">AI will create a personalized plan for you</p>
                </div>
              </div>

              <form onSubmit={generateRoutine} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">What&apos;s your study goal?</Label>
                  <Input
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., Prepare for math exam, Learn chemistry basics..."
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Hours per day</Label>
                    <Select value={availableHours} onValueChange={setAvailableHours}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="3">3 hours</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="5">5+ hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Days per week</Label>
                    <Select value={daysPerWeek} onValueChange={setDaysPerWeek}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="4">4 days</SelectItem>
                        <SelectItem value="5">5 days</SelectItem>
                        <SelectItem value="6">6 days</SelectItem>
                        <SelectItem value="7">Every day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowGenerator(false)}
                    className="border-border text-muted-foreground hover:text-foreground bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!goal.trim() || isGenerating}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Routine
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Study Routines */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Your Study Routines
          </h2>

          {routines.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No routines yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first AI-powered study routine to stay organized and achieve your learning goals.
              </p>
              <Button
                onClick={() => setShowGenerator(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Routine
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {routines.map((routine) => (
                <RoutineCard key={routine.id} routine={routine} onDelete={() => deleteRoutine(routine.id)} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Reminder Modal */}
      {showReminderModal && <ReminderModal onSave={saveReminder} onClose={() => setShowReminderModal(false)} />}
    </div>
  )
}

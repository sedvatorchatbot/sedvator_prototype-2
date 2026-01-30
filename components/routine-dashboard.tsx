"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Calendar, Clock, BookOpen, ArrowLeft } from "lucide-react"
import { AdvancedRoutineBuilder } from "@/components/advanced-routine-builder"
import { NotificationPermissionManager } from "@/components/notification-permission-manager"
import Link from "next/link"

interface RoutineDashboardProps {
  user: any
  profile: any
  initialRoutines: any[]
  initialReminders: any[]
}

export function RoutineDashboard({
  user,
  profile,
  initialRoutines,
  initialReminders,
}: RoutineDashboardProps) {
  const [routines, setRoutines] = useState(initialRoutines)
  const [reminders, setReminders] = useState(initialReminders)
  const [showBuilder, setShowBuilder] = useState(false)
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null)

  const handleSaveRoutine = async (routineData: any) => {
    try {
      const response = await fetch("/api/routine/advanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(routineData),
      })

      if (!response.ok) {
        throw new Error("Failed to save routine")
      }

      const result = await response.json()

      setRoutines([result.routine, ...routines])
      setReminders((prev) => [...(result.reminders || []), ...prev])
      setShowBuilder(false)

      alert(
        `Routine created with ${result.remindersCreated} automatic reminders!`
      )
    } catch (error) {
      console.error("Error saving routine:", error)
      alert("Failed to save routine. Please try again.")
    }
  }

  const calculateTotalHours = (sessions: any[]) => {
    return sessions
      .filter((s) => !s.is_break)
      .reduce((total, session) => {
        const start = new Date(`2024-01-01T${session.start_time}`)
        const end = new Date(`2024-01-01T${session.end_time}`)
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        return total + hours
      }, 0)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link href="/chat">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold text-foreground">Study Routines</h1>
            <p className="text-xs text-muted-foreground">
              Plan your learning journey with 16+ hour routines
            </p>
          </div>
        </div>
        {!showBuilder && (
          <Button
            onClick={() => setShowBuilder(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            New Routine
          </Button>
        )}
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Notification Settings */}
        <Card className="p-6 border-border">
          <NotificationPermissionManager />
        </Card>

        {/* Routine Builder */}
        {showBuilder && (
          <Card className="p-6 border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Build Your Advanced Routine</h2>
              <Button onClick={() => setShowBuilder(false)} variant="outline">
                Cancel
              </Button>
            </div>
            <AdvancedRoutineBuilder
              onSave={handleSaveRoutine}
              initialData={selectedRoutine}
            />
          </Card>
        )}

        {/* Routines List */}
        {!showBuilder && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Routines</h2>

            {routines && routines.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {routines.map((routine) => {
                  const sessions = routine.routine_sessions || []
                  const totalHours = calculateTotalHours(sessions)
                  const activeReminders = reminders.filter(
                    (r) => r.routine_id === routine.id && r.is_active
                  ).length

                  return (
                    <Card
                      key={routine.id}
                      className="p-4 border-border hover:border-cyan-500/50 transition-colors cursor-pointer"
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">
                            {routine.name}
                          </h3>
                          {routine.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {routine.description}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-cyan-400" />
                            <span>
                              {totalHours.toFixed(1)}h of {routine.daily_hours}h
                              daily
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-cyan-400" />
                            <span>{sessions.length} sessions</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-4 w-4 text-cyan-400" />
                            <span>{activeReminders} reminders active</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <details className="text-sm">
                            <summary className="cursor-pointer font-medium text-cyan-400 hover:text-cyan-300">
                              View Sessions ({sessions.length})
                            </summary>
                            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                              {sessions.map((session) => (
                                <div
                                  key={session.id}
                                  className={`flex justify-between items-center text-xs p-2 rounded ${
                                    session.is_break
                                      ? "bg-yellow-500/10 border border-yellow-500/30"
                                      : "bg-background border border-border"
                                  }`}
                                >
                                  <div>
                                    <div className="font-medium">
                                      {session.session_name}
                                    </div>
                                    {session.subject && (
                                      <div className="text-muted-foreground">
                                        {session.subject}
                                      </div>
                                    )}
                                    {session.notes && (
                                      <div className="text-muted-foreground text-xs">
                                        {session.notes}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-muted-foreground whitespace-nowrap ml-2">
                                    {session.start_time} - {session.end_time}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="p-8 border-border text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  No routines yet. Create your first advanced routine to get
                  started!
                </p>
                <Button
                  onClick={() => setShowBuilder(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create First Routine
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* Active Reminders Section */}
        {!showBuilder && reminders && reminders.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Active Reminders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reminders
                .filter((r) => r.is_active)
                .map((reminder) => {
                  const session = reminder.routine_sessions
                  return (
                    <Card
                      key={reminder.id}
                      className="p-4 border-cyan-500/30 bg-cyan-500/5"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-cyan-400">
                              {session?.session_name}
                            </h4>
                            {session?.subject && (
                              <p className="text-sm text-muted-foreground">
                                {session.subject}
                              </p>
                            )}
                          </div>
                          <Clock className="h-5 w-5 text-cyan-400" />
                        </div>
                        <p className="text-sm">
                          Reminder at {reminder.reminder_time}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Notification type: {reminder.reminder_type}
                        </p>
                      </div>
                    </Card>
                  )
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

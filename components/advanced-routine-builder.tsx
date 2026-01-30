"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Trash2, Plus, Clock, BookOpen } from "lucide-react"

interface RoutineSession {
  id?: string
  sessionName: string
  subject: string
  startTime: string
  endTime: string
  isBreak: boolean
  notes: string
}

interface AdvancedRoutineBuilderProps {
  onSave: (routine: any) => Promise<void>
  initialData?: any
}

export function AdvancedRoutineBuilder({
  onSave,
  initialData,
}: AdvancedRoutineBuilderProps) {
  const [routineName, setRoutineName] = useState(initialData?.name || "")
  const [dailyHours, setDailyHours] = useState(initialData?.daily_hours || 8)
  const [sessions, setSessions] = useState<RoutineSession[]>(
    initialData?.sessions || [
      {
        sessionName: "Session 1",
        subject: "Math",
        startTime: "09:00",
        endTime: "10:00",
        isBreak: false,
        notes: "",
      },
    ]
  )
  const [isSaving, setIsSaving] = useState(false)

  // Calculate total study hours from sessions
  const calculateTotalHours = () => {
    return sessions.reduce((total, session) => {
      if (!session.isBreak) {
        const start = new Date(`2024-01-01T${session.startTime}`)
        const end = new Date(`2024-01-01T${session.endTime}`)
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        return total + hours
      }
      return total
    }, 0)
  }

  const addSession = () => {
    setSessions([
      ...sessions,
      {
        sessionName: `Session ${sessions.length + 1}`,
        subject: "",
        startTime: "10:00",
        endTime: "11:00",
        isBreak: false,
        notes: "",
      },
    ])
  }

  const updateSession = (index: number, field: string, value: any) => {
    const newSessions = [...sessions]
    newSessions[index] = { ...newSessions[index], [field]: value }
    setSessions(newSessions)
  }

  const removeSession = (index: number) => {
    setSessions(sessions.filter((_, i) => i !== index))
  }

  const addBreak = () => {
    setSessions([
      ...sessions,
      {
        sessionName: "Break",
        subject: "",
        startTime: "12:00",
        endTime: "13:00",
        isBreak: true,
        notes: "Lunch break",
      },
    ])
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave({
        name: routineName,
        daily_hours: dailyHours,
        sessions: sessions,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const totalHours = calculateTotalHours()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Routine Header */}
      <div className="space-y-4 p-4 bg-card border border-border rounded-lg">
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Routine Name
          </label>
          <Input
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            placeholder="e.g., My Study Schedule"
            className="mt-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Total Daily Hours
            </label>
            <Input
              type="number"
              min="1"
              max="24"
              value={dailyHours}
              onChange={(e) => setDailyHours(parseInt(e.target.value))}
              className="mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Study Time (Calculated)
            </label>
            <div className="mt-2 p-2 bg-background border border-cyan-500/30 rounded flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span className="font-semibold text-cyan-400">
                {totalHours.toFixed(1)}h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Study Sessions</h3>
          <div className="flex gap-2">
            <Button
              onClick={addSession}
              size="sm"
              variant="outline"
              className="gap-2 bg-transparent"
            >
              <Plus className="h-4 w-4" />
              Add Session
            </Button>
            <Button
              onClick={addBreak}
              size="sm"
              variant="outline"
              className="gap-2 bg-transparent"
            >
              <Plus className="h-4 w-4" />
              Add Break
            </Button>
          </div>
        </div>

        {sessions.map((session, index) => (
          <Card
            key={index}
            className={`p-4 space-y-3 border ${
              session.isBreak
                ? "border-yellow-500/30 bg-yellow-500/5"
                : "border-border"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      {session.isBreak ? "Break Name" : "Session Name"}
                    </label>
                    <Input
                      value={session.sessionName}
                      onChange={(e) =>
                        updateSession(index, "sessionName", e.target.value)
                      }
                      placeholder="e.g., Math Class"
                      size={1}
                      className="mt-1"
                    />
                  </div>

                  {!session.isBreak && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Subject
                      </label>
                      <Input
                        value={session.subject}
                        onChange={(e) =>
                          updateSession(index, "subject", e.target.value)
                        }
                        placeholder="e.g., Mathematics"
                        size={1}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Start Time
                    </label>
                    <Input
                      type="time"
                      value={session.startTime}
                      onChange={(e) =>
                        updateSession(index, "startTime", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      End Time
                    </label>
                    <Input
                      type="time"
                      value={session.endTime}
                      onChange={(e) =>
                        updateSession(index, "endTime", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Notes
                  </label>
                  <Input
                    value={session.notes}
                    onChange={(e) =>
                      updateSession(index, "notes", e.target.value)
                    }
                    placeholder="Optional notes..."
                    size={1}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                onClick={() => removeSession(index)}
                size="sm"
                variant="ghost"
                className="text-red-400 hover:text-red-300 ml-4"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving || !routineName}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
      >
        {isSaving ? "Saving..." : "Save Routine & Create Reminders"}
      </Button>
    </div>
  )
}

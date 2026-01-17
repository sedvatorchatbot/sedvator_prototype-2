"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Trash2, Clock, Lightbulb } from "lucide-react"

interface StudySession {
  time: string
  subject: string
  activity: string
  duration: number
}

interface DaySchedule {
  day: string
  sessions: StudySession[]
}

interface StudyRoutine {
  id: string
  title: string
  schedule: {
    weeklySchedule: DaySchedule[]
    tips: string[]
  }
  created_at: string
}

export function RoutineCard({ routine, onDelete }: { routine: StudyRoutine; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{routine.title}</h3>
            <p className="text-xs text-muted-foreground">Created {formatDate(routine.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border">
          {/* Weekly Schedule */}
          <div className="p-4 space-y-4">
            {routine.schedule?.weeklySchedule?.map((day) => (
              <div key={day.day}>
                <h4 className="font-medium text-foreground mb-2">{day.day}</h4>
                <div className="space-y-2">
                  {day.sessions?.map((session, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{session.subject}</p>
                        <p className="text-xs text-muted-foreground">{session.activity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-foreground">{session.time}</p>
                        <p className="text-xs text-muted-foreground">{session.duration} min</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          {routine.schedule?.tips && routine.schedule.tips.length > 0 && (
            <div className="p-4 border-t border-border bg-cyan-500/5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                <h4 className="font-medium text-foreground">Study Tips</h4>
              </div>
              <ul className="space-y-2">
                {routine.schedule.tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

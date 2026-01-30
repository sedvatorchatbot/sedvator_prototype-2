'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'

interface AnalysisProps {
  result: {
    attempt: {
      obtained_marks: number
      total_marks: number
      total_time_spent: number
    }
    analysis: {
      total_correct: number
      total_incorrect: number
      total_unattempted: number
      accuracy_percentage: number
      subject_wise_analysis: Record<string, any>
      difficulty_wise_analysis: Record<string, any>
      strength_areas: string[]
      weakness_areas: string[]
    }
    scores: {
      totalCorrect: number
      totalIncorrect: number
      totalUnattempted: number
      totalObtainedMarks: number
      accuracy: string
    }
  }
  onRetry?: () => void
}

export function MockTestAnalysis({ result, onRetry }: AnalysisProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const accuracyPercentage = parseFloat(result.analysis.accuracy_percentage.toString())
  const obtainedMarks = result.attempt.obtained_marks
  const totalMarks = result.attempt.total_marks

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card className="p-8 border-border bg-gradient-to-br from-cyan-500/10 to-blue-600/10 space-y-4">
        <div className="text-center">
          <h2 className="text-lg text-muted-foreground mb-2">Final Score</h2>
          <div className="text-5xl font-bold text-cyan-400 mb-2">
            {obtainedMarks.toFixed(1)}/{totalMarks}
          </div>
          <div className="text-2xl font-semibold text-foreground mb-4">
            {accuracyPercentage.toFixed(1)}% Accuracy
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Time Taken</p>
            <p className="text-lg font-semibold text-foreground flex items-center justify-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-cyan-400" />
              {formatTime(result.attempt.total_time_spent)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Questions Solved</p>
            <p className="text-lg font-semibold text-green-400">
              {result.scores.totalCorrect}/{result.scores.totalCorrect + result.scores.totalIncorrect + result.scores.totalUnattempted}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-sm">Average Time/Question</p>
            <p className="text-lg font-semibold text-foreground">
              {(result.attempt.total_time_spent / (result.scores.totalCorrect + result.scores.totalIncorrect + result.scores.totalUnattempted)).toFixed(0)}s
            </p>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4 border-green-500/30 bg-green-500/5">
          <p className="text-muted-foreground text-sm">Correct</p>
          <p className="text-2xl font-bold text-green-400">{result.scores.totalCorrect}</p>
          <p className="text-xs text-muted-foreground mt-1">+{result.scores.totalCorrect * 4} marks</p>
        </Card>
        <Card className="p-4 border-red-500/30 bg-red-500/5">
          <p className="text-muted-foreground text-sm">Incorrect</p>
          <p className="text-2xl font-bold text-red-400">{result.scores.totalIncorrect}</p>
          <p className="text-xs text-muted-foreground mt-1">{result.scores.totalIncorrect * -2} marks</p>
        </Card>
        <Card className="p-4 border-yellow-500/30 bg-yellow-500/5">
          <p className="text-muted-foreground text-sm">Unattempted</p>
          <p className="text-2xl font-bold text-yellow-400">{result.scores.totalUnattempted}</p>
          <p className="text-xs text-muted-foreground mt-1">0 marks</p>
        </Card>
        <Card className="p-4 border-cyan-500/30 bg-cyan-500/5">
          <p className="text-muted-foreground text-sm">Accuracy</p>
          <p className="text-2xl font-bold text-cyan-400">{accuracyPercentage.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-1">Performance</p>
        </Card>
      </div>

      {/* Subject Wise Analysis */}
      {Object.keys(result.analysis.subject_wise_analysis).length > 0 && (
        <Card className="p-6 border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Subject Wise Analysis
          </h3>
          <div className="space-y-4">
            {Object.entries(result.analysis.subject_wise_analysis).map(([subject, data]: [string, any]) => {
              const total = data.correct + data.incorrect + (data.unattempted || 0)
              const accuracy = (data.correct / (data.correct + data.incorrect)) * 100 || 0

              return (
                <div key={subject} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground capitalize">
                      {subject.replace('_', ' ')}
                    </span>
                    <span className={`text-sm font-semibold ${accuracy >= 70 ? 'text-green-400' : accuracy >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {accuracy.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <div className="flex-1 bg-green-500/20 rounded h-2">
                      <div
                        className="bg-green-500 h-full rounded"
                        style={{ width: `${(data.correct / total) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      {data.correct}
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-red-400" />
                      {data.incorrect}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Difficulty Wise Analysis */}
      {Object.keys(result.analysis.difficulty_wise_analysis).length > 0 && (
        <Card className="p-6 border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Difficulty Wise Analysis
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(result.analysis.difficulty_wise_analysis).map(([difficulty, data]: [string, any]) => (
              <Card key={difficulty} className="p-4 border-border bg-background">
                <p className="text-sm text-muted-foreground mb-2 capitalize">{difficulty}</p>
                <p className="text-2xl font-bold text-cyan-400 mb-1">{data.correct}</p>
                <p className="text-xs text-muted-foreground">
                  Correct out of {data.correct + data.incorrect}
                </p>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Strength and Weakness */}
      <div className="grid md:grid-cols-2 gap-4">
        {result.analysis.strength_areas.length > 0 && (
          <Card className="p-6 border-green-500/30 bg-green-500/5">
            <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Strength Areas
            </h4>
            <ul className="space-y-1">
              {result.analysis.strength_areas.map((area) => (
                <li key={area} className="text-sm text-foreground capitalize">
                  • {area.replace('_', ' ')}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {result.analysis.weakness_areas.length > 0 && (
          <Card className="p-6 border-red-500/30 bg-red-500/5">
            <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Areas to Improve
            </h4>
            <ul className="space-y-1">
              {result.analysis.weakness_areas.map((area) => (
                <li key={area} className="text-sm text-foreground capitalize">
                  • {area.replace('_', ' ')}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center pt-4">
        <Button
          onClick={onRetry}
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          Retake Test
        </Button>
        <Button variant="outline" className="border-border bg-transparent">
          View Solutions
        </Button>
      </div>
    </div>
  )
}

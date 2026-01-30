'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, BookOpen } from 'lucide-react'

interface MockTestSelectorProps {
  onTestSelect: (examType: string, subject: string, difficulty: string, jeeAdvancedTime?: number) => void
  isLoading?: boolean
}

export function MockTestSelector({ onTestSelect, isLoading = false }: MockTestSelectorProps) {
  const [examType, setExamType] = useState('cbse_10')
  const [subject, setSubject] = useState('mathematics')
  const [difficulty, setDifficulty] = useState('easy')
  const [jeeAdvancedTime, setJeeAdvancedTime] = useState('3')

  const examOptions = [
    { value: 'cbse_9', label: 'CBSE Class 9' },
    { value: 'cbse_10', label: 'CBSE Class 10' },
    { value: 'cbse_11', label: 'CBSE Class 11' },
    { value: 'cbse_12', label: 'CBSE Class 12' },
    { value: 'jee_mains', label: 'JEE Mains (All Subjects)' },
    { value: 'jee_advanced', label: 'JEE Advanced (All Subjects)' },
  ]

  const jeeAdvancedTimeOptions = [
    { value: '3', label: '3 Hours' },
    { value: '4', label: '4 Hours' },
    { value: '5', label: '5 Hours' },
    { value: '6', label: '6 Hours' },
  ]

  const cbseSubjects = [
    'mathematics',
    'science',
    'english',
    'social_science',
  ]

  const jeeMainsSubjects = [
    'physics',
    'chemistry',
    'mathematics',
  ]

  const jeeAdvancedSubjects = [
    'physics',
    'chemistry',
    'mathematics',
    'biology',
  ]

  const currentSubjects = examType === 'cbse_9' || examType === 'cbse_10' || examType === 'cbse_11' || examType === 'cbse_12' ? cbseSubjects :
    examType === 'jee_mains' ? jeeMainsSubjects :
    jeeAdvancedSubjects

  const isJEE = examType.startsWith('jee_')
  const isJEEAdvanced = examType === 'jee_advanced'

  const handleGenerateTest = () => {
    const time = isJEEAdvanced ? parseInt(jeeAdvancedTime) : undefined
    onTestSelect(examType, subject, difficulty, time)
  }

  return (
    <Card className="p-6 border-border space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl font-semibold text-foreground">Generate Mock Test</h2>
      </div>

      <div className="grid md:grid-cols-1 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Select Exam</label>
          <Select value={examType} onValueChange={setExamType}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {examOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isJEEAdvanced && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Test Duration</label>
            <Select value={jeeAdvancedTime} onValueChange={setJeeAdvancedTime}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {jeeAdvancedTimeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Select Subject</label>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currentSubjects.map((subj) => (
              <SelectItem key={subj} value={subj}>
                {subj.charAt(0).toUpperCase() + subj.slice(1).replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Difficulty Level</label>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg space-y-2">
        <p className="text-sm text-muted-foreground">
          <strong>Question Count & Time:</strong>
        </p>
        {examType.startsWith('cbse_') ? (
          <ul className="text-xs text-muted-foreground space-y-1 ml-2">
            <li>• 35-40 questions per test</li>
            <li>• 3 hours (180 minutes) duration</li>
            <li>• Based on official CBSE board papers</li>
          </ul>
        ) : (
          <ul className="text-xs text-muted-foreground space-y-1 ml-2">
            <li>• 75 questions (25 per subject)</li>
            <li>• Physics: 20 MCQ + 5 Integer</li>
            <li>• Chemistry: 20 MCQ + 5 Integer</li>
            <li>• Math: 20 MCQ + 5 Integer</li>
          </ul>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          Questions from: Official PYQs, Byju's, Allen Academy, Physics Wallah
        </p>
      </div>

      <Button
        onClick={handleGenerateTest}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Test...
          </>
        ) : (
          'Generate Mock Test'
        )}
      </Button>
    </Card>
  )
}

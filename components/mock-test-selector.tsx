'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, BookOpen } from 'lucide-react'

interface MockTestSelectorProps {
  onTestSelect: (examType: string, subject: string | null, difficulty: string) => void
  isLoading?: boolean
}

export function MockTestSelector({ onTestSelect, isLoading = false }: MockTestSelectorProps) {
  const [examType, setExamType] = useState('cbse_10')
  const [subject, setSubject] = useState('mathematics')
  const [difficulty, setDifficulty] = useState('medium')

  const examOptions = [
    { value: 'cbse_9', label: 'CBSE Class 9' },
    { value: 'cbse_10', label: 'CBSE Class 10' },
    { value: 'cbse_11', label: 'CBSE Class 11' },
    { value: 'cbse_12', label: 'CBSE Class 12' },
    { value: 'jee_mains', label: 'JEE Mains (All Subjects)' },
    { value: 'jee_advanced', label: 'JEE Advanced (All Subjects)' },
  ]

  const subjectByExam: Record<string, string[]> = {
    cbse_9: ['mathematics', 'science', 'english', 'social_studies'],
    cbse_10: ['mathematics', 'science', 'english', 'social_studies'],
    cbse_11: ['physics', 'chemistry', 'mathematics', 'biology'],
    cbse_12: ['physics', 'chemistry', 'mathematics', 'biology'],
    jee_mains: ['all'], // All subjects in single test
    jee_advanced: ['all'], // All subjects in single test
  }

  const currentSubjects = subjectByExam[examType] || []
  const isJEE = examType.startsWith('jee_')

  const handleExamChange = (value: string) => {
    setExamType(value)
    const firstSubject = subjectByExam[value]?.[0] || 'all'
    setSubject(firstSubject)
  }

  const handleGenerateTest = () => {
    // For JEE, pass null for subject (it will generate all subjects)
    onTestSelect(examType, isJEE ? null : subject, difficulty)
  }

  return (
    <Card className="p-6 border-border space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl font-semibold text-foreground">Generate Mock Test</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Exam Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Select Exam</label>
          <Select value={examType} onValueChange={handleExamChange}>
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
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-muted-foreground">
          📚 Questions are AI-generated based on previous year exam papers (PYQs). For JEE Advanced,
          some questions will have multiple correct options. Total test time: 3 hours (JEE Mains/Advanced) or 1 hour (CBSE).
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

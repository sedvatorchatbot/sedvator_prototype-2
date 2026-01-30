'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, BookOpen } from 'lucide-react'

interface MockTestSelectorProps {
  onTestSelect: (examType: string) => void
  isLoading?: boolean
}

export function MockTestSelector({ onTestSelect, isLoading = false }: MockTestSelectorProps) {
  const [examType, setExamType] = useState('cbse_10')
  const [subject, setSubject] = useState('')
  const [difficulty, setDifficulty] = useState('easy')

  const examOptions = [
    { value: 'cbse_9', label: 'CBSE Class 9' },
    { value: 'cbse_10', label: 'CBSE Class 10' },
    { value: 'cbse_11', label: 'CBSE Class 11' },
    { value: 'cbse_12', label: 'CBSE Class 12' },
    { value: 'jee_mains', label: 'JEE Mains (All Subjects)' },
    { value: 'jee_advanced', label: 'JEE Advanced (All Subjects)' },
  ]

  const currentSubjects = ['mathematics', 'physics', 'chemistry', 'biology']

  const isJEE = examType.startsWith('jee_')

  const handleExamChange = (value: string) => {
    setExamType(value)
  }

  const handleGenerateTest = () => {
    onTestSelect(examType)
  }

  return (
    <Card className="p-6 border-border space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl font-semibold text-foreground">Generate Mock Test</h2>
      </div>

      <div className="grid md:grid-cols-1 gap-4">
        {/* Exam Type */}
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
          📚 <strong>Questions from:</strong> Official PYQs, Byju's, Allen Academy, Physics Wallah
        </p>
        <p className="text-sm text-muted-foreground">
          ✓ Each test maintains the exact chapter distribution from actual exams
        </p>
      </div>

      <Button onClick={handleGenerateTest} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Generate Test'}
      </Button>
    </Card>
  )
}

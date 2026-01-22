"use client"

import type React from "react"
import type { User } from "@supabase/supabase-js"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { X, Trash2, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface OnboardingModalProps {
  isOpen: boolean
  onComplete: (grade: string, subjects: string[]) => void
  onClose: () => void
  user: User
  initialGrade?: string
  initialSubjects?: string[]
  chatHistoryEnabled?: boolean
  onChatHistoryToggle?: (enabled: boolean) => void
  onClearHistory?: () => void
}

const GRADES = [
  "6th Grade",
  "7th Grade",
  "8th Grade",
  "9th Grade",
  "10th Grade",
  "11th Grade",
  "12th Grade",
]

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Geography",
  "Computer Science",
  "Economics",
  "Psychology",
  "Art",
  "Music",
]

export function OnboardingModal({
  isOpen,
  onComplete,
  onClose,
  user,
  initialGrade,
  initialSubjects,
  chatHistoryEnabled = true,
  onChatHistoryToggle,
  onClearHistory,
}: OnboardingModalProps) {
  const [grade, setGrade] = useState(initialGrade || "")
  const [subjects, setSubjects] = useState<string[]>(initialSubjects || [])
  const [historyEnabled, setHistoryEnabled] = useState(chatHistoryEnabled)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  if (!isOpen) return null

  const toggleSubject = (subject: string) => {
    setSubjects((prev) => (prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (grade && subjects.length > 0) {
      setIsSaving(true)
      try {
        onComplete(grade, subjects)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleHistoryToggle = async (enabled: boolean) => {
    setHistoryEnabled(enabled)
    if (onChatHistoryToggle) {
      onChatHistoryToggle(enabled)
    }
    const supabase = createClient()
    await supabase.from("profiles").update({ chat_history_enabled: enabled }).eq("id", user.id)
  }

  const handleClearHistory = async () => {
    const supabase = createClient()
    await supabase.from("chat_messages").delete().eq("user_id", user.id)
    if (onClearHistory) {
      onClearHistory()
    }
    setShowClearConfirm(false)
  }

  const handleClose = () => {
    onClose()
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return

    setIsDeleting(true)
    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete account")
      }

      // Sign out locally and redirect
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/?deleted=true")
    } catch (error) {
      console.error("Error deleting account:", error)
      alert("Failed to delete account. Please try again.")
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Settings</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grade Selection */}
          <div className="space-y-2">
            <Label className="text-foreground">What grade are you in?</Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Select your grade" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label className="text-foreground">What subjects are you studying?</Label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((subject) => (
                <Button
                  key={subject}
                  type="button"
                  variant={subjects.includes(subject) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSubject(subject)}
                  className={
                    subjects.includes(subject)
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                      : "border-border text-muted-foreground hover:text-foreground bg-transparent"
                  }
                >
                  {subject}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Select at least one subject</p>
          </div>

          {/* Chat History Settings Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <Label className="text-foreground font-medium">Chat History</Label>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm text-foreground">Save chat history</p>
                <p className="text-xs text-muted-foreground">
                  {historyEnabled ? "Your conversations are being saved" : "Conversations will not be saved"}
                </p>
              </div>
              <Switch checked={historyEnabled} onCheckedChange={handleHistoryToggle} />
            </div>

            {historyEnabled && (
              <div className="pt-2">
                {!showClearConfirm ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowClearConfirm(true)}
                    className="text-red-500 border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Chat History
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                    <p className="text-xs text-red-400 flex-1">Delete all your chat history? This cannot be undone.</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowClearConfirm(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleClearHistory}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* End Chat History Settings */}

          {/* Delete Account Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <Label className="text-foreground font-medium text-red-500">Danger Zone</Label>

            {!showDeleteConfirm ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500 border-red-500/30 hover:bg-red-500/10 hover:text-red-400 w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            ) : (
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-400">Delete your account?</p>
                    <p className="text-xs text-red-400/80 mt-1">
                      This will permanently delete all your data including chat history, quizzes, flashcards, game
                      scores, and routines. This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-red-400">Type DELETE to confirm</Label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-3 py-2 bg-background border border-red-500/30 rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteConfirmText("")
                    }}
                    className="flex-1 text-muted-foreground hover:text-foreground"
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== "DELETE" || isDeleting}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete Forever"}
                  </Button>
                </div>
              </div>
            )}
          </div>
          {/* End Delete Account Section */}

          <Button
            type="submit"
            disabled={!grade || subjects.length === 0 || isSaving}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
          >
            {isSaving ? "Saving..." : initialGrade ? "Update Preferences" : "Get Started"}
          </Button>
        </form>
      </div>
    </div>
  )
}

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { JarvisAvatar } from "@/components/jarvis-avatar"
import { MessageBubble } from "@/components/message-bubble"
import { OnboardingModal } from "@/components/onboarding-modal"
import { AnimatedLogo } from "@/components/animated-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { FileUploadButton, FilePreview } from "@/components/file-upload"
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  LogOut,
  Calendar,
  Settings,
  History,
  Gamepad2,
  Shield,
  BrainCircuit,
  Trash2,
  UserPlus,
  Menu,
  X,
  MoreVertical,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { encryptMessage, decryptMessage } from "@/lib/encryption"

interface Profile {
  id: string
  email: string
  display_name: string
  grade: string | null
  subjects: string[] | null
  voice_enabled: boolean
  chat_history_enabled?: boolean
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  resources?: { title: string; url: string; type: string }[]
}

export function ChatInterface({
  user,
  profile,
  isGuest = false,
}: { user: User; profile: Profile | null; isGuest?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(profile?.voice_enabled ?? true)
  const [chatHistoryEnabled, setChatHistoryEnabled] = useState(
    isGuest ? false : (profile?.chat_history_enabled ?? true),
  )
  const [showOnboarding, setShowOnboarding] = useState(!profile?.grade)
  const [userProfile, setUserProfile] = useState(profile)
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(profile?.voice_enabled ?? true)
  const [transcript, setTranscript] = useState("")
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef("")
  const isStartingRef = useRef(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const loadHistory = async () => {
      if (!chatHistoryEnabled) {
        setMessages([])
        return
      }

      const supabase = createClient()
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(50)

      if (data) {
        const decryptedMessages = await Promise.all(
          data.map(async (m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: await decryptMessage(m.content, user.id),
          })),
        )
        setMessages(decryptedMessages)
      }
    }
    loadHistory()
  }, [user.id, chatHistoryEnabled])

  const toggleVoiceReply = async () => {
    const newValue = !voiceReplyEnabled
    setVoiceReplyEnabled(newValue)
    setVoiceEnabled(newValue)

    const supabase = createClient()
    await supabase.from("profiles").update({ voice_enabled: newValue }).eq("id", user.id)
  }

  const toggleChatHistory = async () => {
    const newValue = !chatHistoryEnabled
    setChatHistoryEnabled(newValue)

    const supabase = createClient()
    await supabase.from("profiles").update({ chat_history_enabled: newValue }).eq("id", user.id)

    if (!newValue) {
      setMessages([])
    }
  }

  const clearChatHistory = async () => {
    const supabase = createClient()
    await supabase.from("chat_messages").delete().eq("user_id", user.id)
    setMessages([])
    setShowClearConfirm(false)
  }

  const handleSend = useCallback(
    async (textToSend?: string) => {
      const messageText = (textToSend || input).trim()
      if (!messageText || isLoading) return

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: messageText,
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)

      try {
        // Get the actual file data with extracted text from state
        // We need to query the uploaded files to get their extracted text
        const supabase = createClient()
        const attachments = []
        
        if (selectedFiles.length > 0) {
          // Fetch the most recently uploaded files for this user
          const { data: uploadedFiles, error } = await supabase
            .from('file_attachments')
            .select('id, file_name, file_type, extracted_text')
            .eq('user_id', user?.id || 'guest')
            .order('created_at', { ascending: false })
            .limit(selectedFiles.length)

          if (!error && uploadedFiles) {
            attachments.push(...uploadedFiles.map((file) => ({
              fileName: file.file_name,
              fileType: file.file_type,
              extractedText: file.extracted_text || '',
            })))
          }
        }

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: messageText,
            grade: userProfile?.grade,
            subjects: userProfile?.subjects,
            history: messages.slice(-10),
            attachments: attachments.length > 0 ? attachments : undefined,
          }),
        })

        const data = await response.json()

        if (response.status === 429 || data.isRateLimit) {
          const errorMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              data.error || "I'm getting a lot of requests right now! Please wait about 30-60 seconds and try again.",
          }
          setMessages((prev) => [...prev, errorMessage])
          setIsLoading(false)
          return
        }

        if (data.error && !data.response) {
          const errorMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.error || "Sorry, I encountered an error. Please try again.",
          }
          setMessages((prev) => [...prev, errorMessage])
          setIsLoading(false)
          return
        }

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.response,
          resources: data.resources,
        }

        setMessages((prev) => [...prev, assistantMessage])

        if (chatHistoryEnabled) {
          const supabase = createClient()
          const encryptedUserMessage = await encryptMessage(messageText, user.id)
          const encryptedAssistantMessage = await encryptMessage(data.response, user.id)

          await supabase.from("chat_messages").insert([
            { user_id: user.id, role: "user", content: encryptedUserMessage },
            { user_id: user.id, role: "assistant", content: encryptedAssistantMessage },
          ])
        }

        if (voiceReplyEnabled && data.response) {
          speakResponse(data.response)
        }
      } catch (error) {
        console.error("Chat error:", error)
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    },
    [
      input,
      isLoading,
      messages,
      user.id,
      userProfile?.grade,
      userProfile?.subjects,
      voiceReplyEnabled,
      chatHistoryEnabled,
    ],
  )

  const speakResponse = async (text: string) => {
    if (!text) return
    setIsSpeaking(true)

    speechSynthesis.cancel()
    utteranceRef.current = null

    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance
    utterance.rate = 1.0
    utterance.pitch = 1.0

    const voices = speechSynthesis.getVoices()
    const englishVoice =
      voices.find((v) => v.lang.startsWith("en") && v.name.includes("Male")) ||
      voices.find((v) => v.lang.startsWith("en-GB")) ||
      voices.find((v) => v.lang.startsWith("en"))

    if (englishVoice) {
      utterance.voice = englishVoice
    }

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const startListening = useCallback(async () => {
    if (isStartingRef.current) {
      return
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognitionAPI) {
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.")
      return
    }

    if (isListening && recognitionRef.current) {
      const textToSend = finalTranscriptRef.current.trim() || input.trim()

      try {
        recognitionRef.current.abort()
      } catch (e) {}
      recognitionRef.current = null

      setIsListening(false)
      setTranscript("")
      ;(window as any).__speechRecognitionActive = false

      if (textToSend) {
        setInput("")
        finalTranscriptRef.current = ""
        handleSend(textToSend)
      }

      return
    }

    isStartingRef.current = true
    ;(window as any).__speechRecognitionActive = true

    await new Promise((resolve) => setTimeout(resolve, 100))

    setTranscript("")
    setInput("")
    finalTranscriptRef.current = ""

    const recognition = new SpeechRecognitionAPI()
    recognitionRef.current = recognition

    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.lang = "en-US"

    recognition.onstart = () => {
      isStartingRef.current = false
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " "
        } else {
          interimTranscript += result[0].transcript
        }
      }

      if (finalTranscript) {
        finalTranscriptRef.current = finalTranscript.trim()
      }

      const displayText = (finalTranscript + interimTranscript).trim()
      setTranscript(displayText)
      setInput(displayText)
    }

    recognition.onerror = (event: any) => {
      isStartingRef.current = false

      if (event.error === "not-allowed") {
        alert("Microphone access was denied. Please allow microphone access in your browser settings.")
      }

      setIsListening(false)
      setTranscript("")
      recognitionRef.current = null
      ;(window as any).__speechRecognitionActive = false
    }

    recognition.onend = () => {
      isStartingRef.current = false
      setIsListening(false)
      recognitionRef.current = null
      ;(window as any).__speechRecognitionActive = false
    }

    try {
      recognition.start()
    } catch (error) {
      isStartingRef.current = false
      setIsListening(false)
      setTranscript("")
      ;(window as any).__speechRecognitionActive = false
    }
  }, [isListening, handleSend, input])

  const stopListening = useCallback(() => {
    const textToSend = finalTranscriptRef.current.trim() || input.trim()

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (e) {}
      recognitionRef.current = null
    }

    setIsListening(false)
    setTranscript("")
    ;(window as any).__speechRecognitionActive = false

    if (textToSend) {
      setInput("")
      finalTranscriptRef.current = ""
      handleSend(textToSend)
    }
  }, [handleSend, input])

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("guestSession")
    }

    const supabase = createClient()
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
    router.push("/")
  }

  const handleOnboardingComplete = async (grade: string, subjects: string[]) => {
    const supabase = createClient()
    await supabase.from("profiles").update({ grade, subjects }).eq("id", user.id)
    setUserProfile((prev) => (prev ? { ...prev, grade, subjects } : null))
    setShowOnboarding(false)
  }

  const handleChatHistoryToggle = (enabled: boolean) => {
    setChatHistoryEnabled(enabled)
    if (!enabled) {
      setMessages([])
    }
  }

  const handleClearHistory = () => {
    setMessages([])
  }

  const handleFilesSelected = async (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files])
    setIsUploadingFiles(true)

    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append("files", file)
      })
      formData.append("userId", user?.id || "guest")

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload files")
      }

      console.log("[v0] Files uploaded successfully:", data.attachments)
    } catch (error) {
      console.error("[v0] File upload error:", error)
      setSelectedFiles([])
    } finally {
      setIsUploadingFiles(false)
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSendMessage = () => {
    handleSend()
    setSelectedFiles([])
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header - Clean and minimal */}
      <div className="border-b border-border bg-card/50 px-3 sm:px-6 py-3 sm:py-4 relative z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Menu Button - Left side */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>

          {/* Logo and Title - Center */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <AnimatedLogo size="sm" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-foreground whitespace-nowrap">Sedvator AI</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                End-to-end encrypted
              </p>
            </div>
          </div>

          {/* Icon Shortcuts - Right side */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* My Routine */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/routine" className="block">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>My Routine</TooltipContent>
            </Tooltip>

            {/* Games & Quizzes */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/games" className="block">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Games & Quizzes</TooltipContent>
            </Tooltip>

            {/* Settings */}
            {!isGuest && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowOnboarding(true)}
                    className="text-muted-foreground hover:text-foreground h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            )}

            {/* Clear History */}
            {!isGuest && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowClearConfirm(true)}
                    disabled={messages.length === 0}
                    className="text-muted-foreground hover:text-foreground h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear History</TooltipContent>
              </Tooltip>
            )}

            {/* Disable/Enable History */}
            {!isGuest && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleChatHistory()}
                    className="text-muted-foreground hover:text-foreground h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <History className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{chatHistoryEnabled ? "Disable History" : "Enable History"}</TooltipContent>
              </Tooltip>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Navigation Drawer - Slides in from left */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col overflow-y-auto pt-20`}
      >
        {/* Navigation Menu */}
        <nav className="space-y-1 px-2 flex-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="mr-2">💬</span> Chat
          </Button>
          <Link href="/routine" onClick={() => setSidebarOpen(false)} className="block">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              My Routine
            </Button>
          </Link>
          <Link href="/games" onClick={() => setSidebarOpen(false)} className="block">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <Gamepad2 className="mr-2 h-4 w-4" />
              Games & Quizzes
            </Button>
          </Link>

          {!isGuest && (
            <>
              <div className="my-2 border-t border-border" />
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setShowClearConfirm(true)
                  setSidebarOpen(false)
                }}
                disabled={messages.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear History
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={() => {
                  toggleChatHistory()
                  setSidebarOpen(false)
                }}
              >
                <History className="mr-2 h-4 w-4" />
                {chatHistoryEnabled ? "Disable History" : "Enable History"}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setShowOnboarding(true)
                  setSidebarOpen(false)
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </>
          )}
        </nav>

        {/* Footer Options */}
        <div className="border-t border-border p-2 space-y-1">
          {isGuest && (
            <Link href="/auth/sign-up" onClick={() => setSidebarOpen(false)} className="block">
              <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-black">
                <UserPlus className="h-4 w-4 mr-2" />
                Create Account
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-red-400"
            onClick={() => {
              handleLogout()
              setSidebarOpen(false)
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isGuest ? "Exit Guest Mode" : "Sign Out"}
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-8 max-w-4xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="lg:hidden mb-6">
              <JarvisAvatar size="md" isActive={true} isListening={isListening} isSpeaking={isSpeaking} />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Hello, {userProfile?.display_name || "there"}!
            </h2>
            <p className="text-muted-foreground max-w-md">
              I&apos;m Sedvator, your AI study companion. Ask me anything about your subjects, or click the
              microphone button to start a voice conversation.
            </p>
            {!chatHistoryEnabled && (
              <p className="text-xs text-amber-500 mt-2">
                Chat history is off - your conversations will not be saved
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Voice reply is {voiceReplyEnabled ? "enabled" : "disabled"} - use the speaker icon to toggle
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {["Explain photosynthesis", "Help me with math", "Create a study plan"].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend(suggestion)}
                  className="border-border text-muted-foreground hover:text-foreground bg-transparent"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <div className="w-4 h-4 rounded-full bg-background flex items-center justify-center">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
              </div>
            </div>
            <div className="bg-card rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 px-3 sm:px-6 py-3 sm:py-4">
        <FilePreview files={selectedFiles} onRemove={handleRemoveFile} />
        <div className="max-w-4xl mx-auto flex gap-2 sm:gap-3 items-end">
          <FileUploadButton onFilesSelected={handleFilesSelected} isLoading={isUploadingFiles} />
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
            placeholder={isListening ? "🎤 Listening..." : "Type or click mic..."}
            disabled={isLoading || isUploadingFiles}
            className="flex-1 resize-none text-sm"
          />
          <Button
            onClick={() => startListening()}
            disabled={isLoading || isUploadingFiles}
            size="sm"
            variant={isListening ? "default" : "outline"}
            className="flex-shrink-0"
          >
            {isListening ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>

          {/* Voice Reply Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => {
                    if (isSpeaking) {
                      stopSpeaking()
                    } else {
                      toggleVoiceReply()
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  className={
                    voiceReplyEnabled
                      ? "text-cyan-400 hover:text-cyan-300"
                      : "text-muted-foreground hover:text-foreground"
                  }
                >
                  {voiceReplyEnabled ? <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" /> : <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isSpeaking ? "Click to stop speaking" : voiceReplyEnabled ? "Voice replies ON" : "Voice replies OFF"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            onClick={handleSendMessage}
            disabled={isLoading || isUploadingFiles || (!input.trim() && selectedFiles.length === 0)}
            size="sm"
            className="flex-shrink-0 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>

      {/* Clear History Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-foreground mb-2">Clear Chat History?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete all your chat messages. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={clearChatHistory}>
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        user={user}
        onComplete={handleOnboardingComplete}
        onClose={() => setShowOnboarding(false)}
        chatHistoryEnabled={chatHistoryEnabled}
        onChatHistoryToggle={toggleChatHistory}
        onClearHistory={handleClearHistory}
      />
    </div>
  )
}

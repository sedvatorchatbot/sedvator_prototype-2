import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { JarvisAvatar } from "@/components/jarvis-avatar"
import { AnimatedLogo } from "@/components/animated-logo"
import { MessageSquare, Search, Brain, Calendar, Gamepad2 } from "lucide-react"
import { LightningCursor } from "@/components/lightning-cursor"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LightningCursor />

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,200,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,200,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <AnimatedLogo size="md" />
            <span className="text-lg sm:text-xl font-bold text-foreground ml-2 whitespace-nowrap">Sedvator AI</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <ThemeToggle />
            <Link href="/games">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Games & Quizzes</span>
                <span className="sm:hidden">Games</span>
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm" className="text-xs sm:text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-3 sm:px-4 whitespace-nowrap">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Your Intelligent{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Study Companion
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                Your personal AI tutor is here to help. Get instant explanations tailored to your grade level, discover
                learning resources, play educational games, and build effective study routines.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/auth/sign-up" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 sm:px-8"
                  >
                    Start Learning
                  </Button>
                </Link>
                <Link href="#features" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-border text-foreground bg-transparent"
                  >
                    See Features
                  </Button>
                </Link>
              </div>
            </div>

            {/* Jarvis Avatar Display */}
            <div className="hidden lg:flex justify-center lg:justify-end">
              <JarvisAvatar size="lg" isActive={true} showRings={true} />
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">Powered by Advanced AI</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Sedvator combines voice recognition, intelligent conversation, and personalized learning to help you
              succeed.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <FeatureCard
              icon={<MessageSquare className="w-6 h-6" />}
              title="Voice & Text Input"
              description="Chat naturally with voice or text. Click the microphone button to speak or type your questions."
            />
            <FeatureCard
              icon={<Brain className="w-6 h-6" />}
              title="Grade-Based Learning"
              description="Explanations adapt to your level. Simple for beginners, detailed for advanced students."
            />
            <FeatureCard
              icon={<Search className="w-6 h-6" />}
              title="Internet Search"
              description="Get answers from across the web. Sedvator can search for the latest information, books, and resources."
            />
            <FeatureCard
              icon={<Search className="w-6 h-6" />}
              title="Resource Discovery"
              description="Find the best articles, videos, and tutorials from across the web, curated for your topic."
            />
            <FeatureCard
              icon={<Calendar className="w-6 h-6" />}
              title="Study Routines"
              description="Generate personalized study schedules and set reminders to stay on track."
            />
            <FeatureCard
              icon={<Gamepad2 className="w-6 h-6" />}
              title="Games & Quizzes"
              description="Learn through fun! Play quizzes, flashcards, memory games, word matching, and more to reinforce your knowledge."
            />
          </div>
        </div>
      </section>

      {/* Games CTA Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
              <div className="text-center md:text-left w-full md:w-auto">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 flex-shrink-0" />
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Learn Through Play</h2>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                  Quizzes, flashcards, memory games, word matching, and more! Make studying fun with our interactive
                  games designed for all levels.
                </p>
              </div>
              <Link href="/games" className="w-full md:w-auto">
                <Button
                  size="lg"
                  className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 sm:px-8 whitespace-nowrap"
                >
                  <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden sm:inline">Play Games & Quizzes</span>
                  <span className="sm:hidden">Play Games</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <StepCard
              step="01"
              title="Create Account"
              description="Sign up and tell us your grade level and subjects you're studying."
            />
            <StepCard
              step="02"
              title="Start Chatting"
              description="Use voice or text to ask questions. Click the microphone or type your query."
            />
            <StepCard
              step="03"
              title="Learn & Play"
              description="Get explanations, discover resources, and reinforce learning with games and quizzes."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Transform Your Learning?</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto">
              Join thousands of students who are learning smarter with Sedvator AI.
            </p>
            <Link href="/auth/sign-up">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 sm:px-12"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <AnimatedLogo size="sm" />
            <span className="font-semibold text-sm sm:text-base text-foreground ml-1">Sedvator AI</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Built for students, powered by AI.</p>
        </div>
        <div className="max-w-7xl mx-auto mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground/70">developed by Anmol Ratan</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:border-cyan-500/50 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-cyan-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-6">
        <span className="text-2xl font-bold text-white">{step}</span>
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

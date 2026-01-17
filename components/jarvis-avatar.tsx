"use client"

import { cn } from "@/lib/utils"

interface JarvisAvatarProps {
  size?: "sm" | "md" | "lg"
  isActive?: boolean
  isListening?: boolean
  isSpeaking?: boolean
  showRings?: boolean
  className?: string
}

export function JarvisAvatar({
  size = "md",
  isActive = false,
  isListening = false,
  isSpeaking = false,
  showRings = false,
  className,
}: JarvisAvatarProps) {
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-40 h-40",
    lg: "w-64 h-64",
  }

  const coreSizes = {
    sm: { outer: "w-16 h-16", middle: "w-10 h-10", inner: "w-5 h-5" },
    md: { outer: "w-28 h-28", middle: "w-18 h-18", inner: "w-8 h-8" },
    lg: { outer: "w-44 h-44", middle: "w-28 h-28", inner: "w-12 h-12" },
  }

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      {/* Outer rotating rings */}
      {showRings && (
        <>
          <div
            className={cn(
              "absolute inset-0 rounded-full border-2 border-cyan-500/30 jarvis-ring",
              isActive && "border-cyan-400/50",
            )}
          />
          <div
            className={cn(
              "absolute inset-2 rounded-full border border-blue-500/20 jarvis-ring",
              isActive && "border-blue-400/40",
            )}
            style={{ animationDirection: "reverse", animationDuration: "4s" }}
          />
          <div
            className={cn(
              "absolute inset-4 rounded-full border border-cyan-500/10 jarvis-ring",
              isActive && "border-cyan-400/30",
            )}
            style={{ animationDuration: "5s" }}
          />
        </>
      )}

      {/* Glow effect */}
      <div
        className={cn(
          "absolute rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 blur-xl transition-all duration-500",
          sizeClasses[size],
          isActive && "from-cyan-500/40 to-blue-600/40",
          isSpeaking && "animate-pulse",
        )}
      />

      {/* Main core */}
      <div
        className={cn(
          "relative rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center transition-all duration-300",
          coreSizes[size].outer,
          isActive && "jarvis-glow",
          isSpeaking && "jarvis-pulse",
        )}
      >
        {/* Middle ring */}
        <div
          className={cn(
            "rounded-full bg-background flex items-center justify-center transition-all duration-300",
            coreSizes[size].middle,
          )}
        >
          {/* Inner core */}
          <div
            className={cn(
              "rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 transition-all duration-300",
              coreSizes[size].inner,
              isListening && "animate-ping",
            )}
          />
        </div>

        {/* Listening indicator waves */}
        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-cyan-400 rounded-full listening-wave"
                  style={{
                    height: "20px",
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status indicator */}
      {isActive && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1.5 bg-card/90 backdrop-blur-sm border border-border rounded-full px-3 py-1">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isListening ? "bg-green-400 animate-pulse" : isSpeaking ? "bg-cyan-400 animate-pulse" : "bg-cyan-500",
              )}
            />
            <span className="text-xs text-foreground font-medium">
              {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Ready"}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

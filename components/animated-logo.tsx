"use client"

import { cn } from "@/lib/utils"

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function AnimatedLogo({ size = "md", className }: AnimatedLogoProps) {
  const sizeConfig = {
    sm: { container: "w-10 h-10", nucleus: "w-4 h-4", nucleusInner: "w-2 h-2", electron: 3 },
    md: { container: "w-16 h-16", nucleus: "w-6 h-6", nucleusInner: "w-3 h-3", electron: 4 },
    lg: { container: "w-20 h-20", nucleus: "w-8 h-8", nucleusInner: "w-4 h-4", electron: 5 },
    xl: { container: "w-24 h-24", nucleus: "w-10 h-10", nucleusInner: "w-5 h-5", electron: 6 },
  }

  const config = sizeConfig[size]

  return (
    <div className={cn("relative flex items-center justify-center", config.container, className)}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        {/* Orbit 1 - Horizontal ellipse */}
        <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="1" />

        <circle r={config.electron} fill="#22d3ee" className="drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]">
          <animateMotion dur="3s" repeatCount="indefinite" path="M 95,50 A 45,20 0 1,1 5,50 A 45,20 0 1,1 95,50" />
        </circle>

        {/* Orbit 2 - Tilted ellipse (60 degrees) */}
        <g transform="rotate(60 50 50)">
          <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="rgba(96, 165, 250, 0.4)" strokeWidth="1" />

          <circle r={config.electron} fill="#60a5fa" className="drop-shadow-[0_0_6px_rgba(96,165,250,0.8)]">
            <animateMotion dur="4s" repeatCount="indefinite" path="M 95,50 A 45,20 0 1,1 5,50 A 45,20 0 1,1 95,50" />
          </circle>
        </g>

        {/* Orbit 3 - Tilted ellipse (-60 degrees) */}
        <g transform="rotate(-60 50 50)">
          <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="1" />

          <circle r={config.electron} fill="#a855f7" className="drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]">
            <animateMotion dur="5s" repeatCount="indefinite" path="M 95,50 A 45,20 0 1,1 5,50 A 45,20 0 1,1 95,50" />
          </circle>
        </g>
      </svg>

      {/* Central nucleus with glow */}
      <div
        className={cn(
          "relative rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center z-10",
          config.nucleus,
        )}
        style={{
          boxShadow: "0 0 20px 4px rgba(34, 211, 238, 0.5), 0 0 40px 8px rgba(34, 211, 238, 0.2)",
        }}
      >
        <div
          className={cn("rounded-full bg-gradient-to-br from-cyan-300 to-blue-400 animate-pulse", config.nucleusInner)}
        />
      </div>
    </div>
  )
}

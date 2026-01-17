"use client"

import { ExternalLink, User, Bot } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  resources?: { title: string; url: string; type: string }[]
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-secondary" : "bg-gradient-to-br from-cyan-500 to-blue-600"
        }`}
      >
        {isUser ? <User className="w-4 h-4 text-muted-foreground" /> : <Bot className="w-4 h-4 text-white" />}
      </div>

      {/* Content */}
      <div className={`max-w-[80%] ${isUser ? "text-right" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
              : "bg-card border border-border text-foreground"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Resources */}
        {message.resources && message.resources.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Related Resources:</p>
            {message.resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-card border border-border rounded-lg hover:border-cyan-500/50 transition-colors group"
              >
                <div className="w-6 h-6 rounded bg-cyan-500/10 flex items-center justify-center">
                  <ExternalLink className="w-3 h-3 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate group-hover:text-cyan-400 transition-colors">
                    {resource.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{resource.type}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from "react"
import { AlertTriangle, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PreviewErrorMonitor() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const report = (message: string) => {
      setError(message || "An unexpected preview error occurred.")
    }

    const onError = (event: ErrorEvent) => {
      report(event.error?.message || event.message)
    }

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      report(reason instanceof Error ? reason.message : String(reason))
    }

    window.addEventListener("error", onError)
    window.addEventListener("unhandledrejection", onUnhandledRejection)
    return () => {
      window.removeEventListener("error", onError)
      window.removeEventListener("unhandledrejection", onUnhandledRejection)
    }
  }, [])

  if (!error) return null

  return (
    <div className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-xl rounded-xl border border-red-500/30 bg-background/95 p-4 shadow-2xl backdrop-blur" role="alert">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-500" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Preview error detected</p>
          <p className="mt-1 text-sm text-muted-foreground">The app caught a runtime error. Refreshing may recover the preview.</p>
          <p className="mt-2 max-h-16 overflow-auto rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">{error}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 size-4" aria-hidden="true" />
              Refresh preview
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        </div>
        <button type="button" className="rounded p-1 text-muted-foreground hover:bg-muted" onClick={() => setError(null)} aria-label="Dismiss error notification">
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

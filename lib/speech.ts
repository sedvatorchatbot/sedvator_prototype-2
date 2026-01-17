// Speech recognition types for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
}

export function isSpeechRecognitionSupported(): boolean {
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window
}

export function createSpeechRecognition(): any | null {
  if (!isSpeechRecognitionSupported()) {
    return null
  }

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
  return new SpeechRecognitionClass()
}

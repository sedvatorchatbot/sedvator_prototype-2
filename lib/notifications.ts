/**
 * Advanced Notification System
 * Manages browser notifications, phone notifications, and device alarms
 */

export interface NotificationOptions {
  title: string
  body?: string
  icon?: string
  tag?: string
  badge?: string
  sound?: string
}

/**
 * Request browser notification permission
 */
export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('[v0] Browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    console.log('[v0] Browser notifications already granted')
    return true
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission()
      console.log('[v0] Browser notification permission:', permission)
      return permission === 'granted'
    } catch (error) {
      console.error('[v0] Error requesting notification permission:', error)
      return false
    }
  }

  return false
}

/**
 * Check if browser notifications are available
 */
export function isBrowserNotificationAvailable(): boolean {
  return 'Notification' in window && Notification.permission === 'granted'
}

/**
 * Send browser notification immediately
 */
export function sendBrowserNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!isBrowserNotificationAvailable()) {
    console.log('[v0] Browser notifications not available')
    return null
  }

  try {
    console.log('[v0] Sending browser notification:', title)
    const notification = new Notification(title, {
      body: options?.body,
      icon: options?.icon || '/icon.svg',
      tag: options?.tag || 'study-reminder',
      badge: options?.badge || '/icon.svg',
      requireInteraction: true, // Keep notification visible until user interacts
    })

    // Auto-close after 10 seconds if not interacted
    setTimeout(() => {
      notification.close()
    }, 10000)

    return notification
  } catch (error) {
    console.error('[v0] Error sending notification:', error)
    return null
  }
}

/**
 * Schedule a notification for a specific time
 */
export function scheduleNotification(
  title: string,
  reminderTime: string, // HH:MM format
  options?: NotificationOptions
): number | null {
  try {
    const now = new Date()
    const [hours, minutes] = reminderTime.split(':').map(Number)

    const reminderDate = new Date()
    reminderDate.setHours(hours, minutes, 0, 0)

    // If time is in the past today, schedule for tomorrow
    if (reminderDate < now) {
      reminderDate.setDate(reminderDate.getDate() + 1)
    }

    const delay = reminderDate.getTime() - now.getTime()

    console.log('[v0] Scheduling notification for', reminderDate, 'delay:', delay)

    const timeoutId = setTimeout(() => {
      sendBrowserNotification(title, options)
    }, delay)

    return timeoutId
  } catch (error) {
    console.error('[v0] Error scheduling notification:', error)
    return null
  }
}

/**
 * Request phone notification permission and set device alarm
 */
export async function requestPhoneNotificationPermission(): Promise<boolean> {
  try {
    // Check if device supports vibration and notifications
    if (!('vibrate' in navigator) && !('Notification' in window)) {
      console.log('[v0] Device does not support phone notifications')
      return false
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission()
      console.log('[v0] Phone notification permission:', permission)
      return permission === 'granted'
    }

    return true
  } catch (error) {
    console.error('[v0] Error requesting phone notification permission:', error)
    return false
  }
}

/**
 * Check if device supports phone notifications
 */
export function isPhoneNotificationAvailable(): boolean {
  return 'vibrate' in navigator || ('Notification' in window && Notification.permission === 'granted')
}

/**
 * Set device alarm
 */
export async function setDeviceAlarm(
  reminderTime: string, // HH:MM format
  title: string
): Promise<boolean> {
  try {
    console.log('[v0] Setting device alarm for', reminderTime, 'title:', title)

    // Gentle vibration feedback (don't shake screen excessively)
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(100) // Single short vibration
      } catch (e) {
        console.log('[v0] Vibration not available')
      }
    }

    // Schedule the alarm notification
    scheduleNotification(`${title} - Study Time!`, reminderTime, {
      body: `Time to start: ${title}`,
      icon: '/icon.svg',
    })

    // Schedule vibration at alarm time (don't vibrate immediately)
    const [hours, minutes] = reminderTime.split(':').map(Number)
    const now = new Date()
    const alarmDate = new Date()
    alarmDate.setHours(hours, minutes, 0, 0)

    if (alarmDate < now) {
      alarmDate.setDate(alarmDate.getDate() + 1)
    }

    const delay = alarmDate.getTime() - now.getTime()

    setTimeout(() => {
      // Gentle vibration pattern at alarm time
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]) // Short vibration pattern
      }
      // Try to play sound
      playAlarmSound()
    }, delay)

    return true
  } catch (error) {
    console.error('[v0] Error setting device alarm:', error)
    return false
  }
}

/**
 * Play alarm sound safely
 */
export function playAlarmSound(): void {
  try {
    // Try using Web Audio API if available and supported
    if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        
        // Resume audio context if suspended (required by browser autoplay policy)
        if (audioContext.state === 'suspended') {
          audioContext.resume()
        }

        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Gentle alarm frequency pattern
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2)

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + 1)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 1)

        console.log('[v0] Playing alarm sound via Web Audio API')
        return
      } catch (audioError) {
        console.warn('[v0] Web Audio API failed, trying fallback:', audioError)
      }
    }

    // Fallback: Try using HTML5 audio element with data URL
    try {
      const audioDataUrl = 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='
      const audio = new Audio(audioDataUrl)
      audio.volume = 0.3
      audio.play().catch((e) => console.log('[v0] Audio playback failed:', e))
      console.log('[v0] Playing alarm sound via HTML5 audio')
    } catch (e) {
      console.log('[v0] Audio playback not available:', e)
    }
  } catch (error) {
    console.error('[v0] Error playing alarm sound:', error)
  }
}

/**
 * Cancel a scheduled notification
 */
export function cancelScheduledNotification(timeoutId: number): void {
  clearTimeout(timeoutId)
  console.log('[v0] Cancelled scheduled notification')
}

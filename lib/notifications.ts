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
 * Schedule a notification to show at a specific time
 */
export function scheduleNotification(
  title: string,
  time: string, // HH:MM format
  options?: NotificationOptions
): void {
  try {
    const [hours, minutes] = time.split(':').map(Number)
    const now = new Date()
    const notifyDate = new Date()
    notifyDate.setHours(hours, minutes, 0, 0)

    // If time has passed today, schedule for tomorrow
    if (notifyDate < now) {
      notifyDate.setDate(notifyDate.getDate() + 1)
    }

    const delay = notifyDate.getTime() - now.getTime()
    console.log('[v0] Scheduling notification at', time, 'in', Math.round(delay / 1000), 'seconds')

    // Store scheduled notification in session storage for persistence across page reloads
    const scheduledNotifications = JSON.parse(sessionStorage.getItem('scheduledNotifications') || '[]')
    const timeoutId = setTimeout(() => {
      console.log('[v0] Triggering scheduled notification:', title)
      sendBrowserNotification(title, options)
    }, delay)

    scheduledNotifications.push({
      title,
      time,
      options,
      scheduledAt: now.getTime(),
      timeoutId,
    })
    sessionStorage.setItem('scheduledNotifications', JSON.stringify(scheduledNotifications))
  } catch (error) {
    console.error('[v0] Error scheduling notification:', error)
  }
}

/**
 * Send browser notification (requires permission)
 */
export function sendBrowserNotification(
  title: string,
  options?: NotificationOptions
): boolean {
  try {
    if (!('Notification' in window)) {
      console.log('[v0] Notifications not supported')
      return false
    }

    if (Notification.permission === 'granted') {
      console.log('[v0] Sending notification:', title)
      // Use service worker if available for better reliability
      if ('serviceWorker' in navigator && 'registration' in navigator.serviceWorker) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            icon: '/icon.svg',
            badge: '/icon.svg',
            ...options,
          })
        })
      } else {
        // Fallback to direct notification
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

        return true
      }
    }

    console.log('[v0] Notification permission not granted:', Notification.permission)
    return false
  } catch (error) {
    console.error('[v0] Error sending notification:', error)
    return false
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
 * Check if browser notifications are available
 */
export function isBrowserNotificationAvailable(): boolean {
  return 'Notification' in window && Notification.permission === 'granted'
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

    // Parse the time
    const [hours, minutes] = reminderTime.split(':').map(Number)
    const now = new Date()
    const alarmDate = new Date()
    alarmDate.setHours(hours, minutes, 0, 0)

    if (alarmDate < now) {
      alarmDate.setDate(alarmDate.getDate() + 1)
    }

    const delay = alarmDate.getTime() - now.getTime()
    console.log('[v0] Alarm will trigger in', Math.round(delay / 1000), 'seconds at', reminderTime)

    // Store alarm in session storage for persistence
    const storedAlarms = JSON.parse(sessionStorage.getItem('alarms') || '[]')
    const timeoutId = setTimeout(() => {
      console.log('[v0] ALARM TRIGGER:', title)
      // Trigger alarm with stronger feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([500, 200, 500, 200, 500, 200, 500, 200, 500])
      }
      playAlarmSound()
      
      // Try to show notification
      sendBrowserNotification(`🔔 ${title}`, {
        body: `Your study session "${title}" is starting now!`,
        icon: '/icon.svg',
        badge: '/icon.svg',
        requireInteraction: true, // Keep notification until user interacts
      })
    }, delay)

    storedAlarms.push({
      time: reminderTime,
      title,
      scheduledAt: now.getTime(),
      triggerTime: alarmDate.getTime(),
      timeoutId,
    })
    sessionStorage.setItem('alarms', JSON.stringify(storedAlarms))

    return true
  } catch (error) {
    console.error('[v0] Error setting device alarm:', error)
    return false
  }
}

/**
 * Start checking for alarms periodically (runs every 30 seconds)
 * This helps catch alarms even if the app was in the background
 */
export function startAlarmChecker(): void {
  console.log('[v0] Starting alarm checker')
  
  // Check every 30 seconds for missed or upcoming alarms
  const checkInterval = setInterval(() => {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    
    // Get stored alarms
    const storedAlarms = JSON.parse(sessionStorage.getItem('alarms') || '[]')
    
    for (const alarm of storedAlarms) {
      const triggerTime = new Date(alarm.triggerTime)
      const timeDiff = Math.abs(now.getTime() - triggerTime.getTime())
      
      // If we're within 1 minute of the alarm time, trigger it
      if (timeDiff < 60000 && !alarm.triggered) {
        console.log('[v0] Alarm check triggered:', alarm.title, 'at', currentTime)
        
        if ('vibrate' in navigator) {
          navigator.vibrate([500, 200, 500, 200, 500, 200, 500])
        }
        playAlarmSound()
        
        sendBrowserNotification(`🔔 ${alarm.title}`, {
          body: `Your study session "${alarm.title}" is starting now!`,
          icon: '/icon.svg',
          badge: '/icon.svg',
          requireInteraction: true,
        })
        
        // Mark as triggered
        alarm.triggered = true
        sessionStorage.setItem('alarms', JSON.stringify(storedAlarms))
      }
    }
  }, 30000) // Check every 30 seconds

  // Store interval ID for cleanup
  ;(window as any).alarmCheckInterval = checkInterval
}

/**
 * Stop the alarm checker
 */
export function stopAlarmChecker(): void {
  if ((window as any).alarmCheckInterval) {
    clearInterval((window as any).alarmCheckInterval)
    console.log('[v0] Alarm checker stopped')
  }
}

/**
 * Play alarm sound
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

// Function to cancel all scheduled notifications
export function cancelAllScheduledNotifications(): void {
  const scheduledNotifications = JSON.parse(sessionStorage.getItem('scheduledNotifications') || '[]')
  scheduledNotifications.forEach((notification: any) => {
    clearTimeout(notification.timeoutId)
  })
  sessionStorage.removeItem('scheduledNotifications')
  console.log('[v0] All scheduled notifications cancelled')
}

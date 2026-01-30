/**
 * Notification Permission Handler
 * Manages browser and phone notification permissions
 */

export interface NotificationPermissions {
  browserEnabled: boolean
  phoneEnabled: boolean
}

/**
 * Request browser notification permission
 */
export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("[v0] Browser does not support notifications")
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    } catch (error) {
      console.error("[v0] Error requesting notification permission:", error)
      return false
    }
  }

  return false
}

/**
 * Check if browser notifications are available
 */
export function isBrowserNotificationAvailable(): boolean {
  return "Notification" in window && Notification.permission === "granted"
}

/**
 * Send browser notification
 */
export function sendBrowserNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!isBrowserNotificationAvailable()) {
    return null
  }

  try {
    return new Notification(title, {
      icon: "/icon.svg",
      badge: "/icon.svg",
      ...options,
    })
  } catch (error) {
    console.error("[v0] Error sending notification:", error)
    return null
  }
}

/**
 * Request phone/push notification permission
 * Uses Service Worker and Push API
 */
export async function requestPhoneNotificationPermission(): Promise<boolean> {
  try {
    // Check if service worker is supported
    if (!("serviceWorker" in navigator)) {
      console.log("[v0] Service Worker not supported")
      return false
    }

    // Check if Push API is supported
    if (!("PushManager" in window)) {
      console.log("[v0] Push Manager not supported")
      return false
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    })

    // Request notification permission
    const permission = await Notification.requestPermission()
    if (permission !== "granted") {
      return false
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    })

    console.log("[v0] Push subscription successful:", subscription)
    return true
  } catch (error) {
    console.error("[v0] Error requesting phone notification permission:", error)
    return false
  }
}

/**
 * Check if phone notifications are available
 */
export async function isPhoneNotificationAvailable(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false
  if (!("PushManager" in window)) return false

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return subscription !== null
  } catch (error) {
    return false
  }
}

/**
 * Schedule a notification for a specific time
 */
export function scheduleNotification(
  title: string,
  time: Date,
  options?: NotificationOptions
): NodeJS.Timeout | null {
  const now = new Date()
  const delay = time.getTime() - now.getTime()

  if (delay < 0) {
    console.warn("[v0] Cannot schedule notification for past time")
    return null
  }

  return setTimeout(() => {
    sendBrowserNotification(title, options)
  }, delay)
}

/**
 * Cancel scheduled notification
 */
export function cancelScheduledNotification(timeoutId: NodeJS.Timeout): void {
  clearTimeout(timeoutId)
}

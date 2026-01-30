'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Bell, Smartphone, AlertCircle, CheckCircle } from 'lucide-react'
import {
  requestBrowserNotificationPermission,
  requestPhoneNotificationPermission,
  sendBrowserNotification,
  playAlarmSound,
  isBrowserNotificationAvailable,
  isPhoneNotificationAvailable,
} from '@/lib/notifications'

export function NotificationPermissionManager() {
  const [browserEnabled, setBrowserEnabled] = useState(false)
  const [phoneEnabled, setPhoneEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [browserDenied, setBrowserDenied] = useState(false)
  const [phoneDenied, setPhoneDenied] = useState(false)

  // Check permissions on component mount and when window focus changes
  useEffect(() => {
    const checkPermissions = async () => {
      const browserAvailable = isBrowserNotificationAvailable()
      setBrowserEnabled(browserAvailable)
      console.log('[v0] Browser notifications available:', browserAvailable)
      
      if ('Notification' in window && Notification.permission === 'denied') {
        setBrowserDenied(true)
        console.log('[v0] Browser notifications denied')
      } else {
        setBrowserDenied(false)
      }

      const phoneAvailable = isPhoneNotificationAvailable()
      setPhoneEnabled(phoneAvailable)
      console.log('[v0] Phone notifications available:', phoneAvailable)
    }

    checkPermissions()
    
    // Re-check when window regains focus (user may have changed settings)
    window.addEventListener('focus', checkPermissions)
    return () => window.removeEventListener('focus', checkPermissions)
  }, [])

  const handleBrowserPermission = async () => {
    setIsLoading(true)
    setMessage('')
    try {
      console.log('[v0] Requesting browser notification permission...')
      const granted = await requestBrowserNotificationPermission()
      setBrowserEnabled(granted)
      setBrowserDenied(!granted && 'Notification' in window && Notification.permission === 'denied')

      if (granted) {
        console.log('[v0] Browser notifications granted!')
        setMessage('✓ Browser notifications enabled!')
        
        // Send test notification
        setTimeout(() => {
          sendBrowserNotification('Study Reminder Enabled! 📚', {
            body: 'You will receive study reminders as desktop notifications',
            icon: '/icon.svg',
          })
        }, 500)

        // Save to database
        try {
          await fetch('/api/notifications/permissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              browser_notifications_enabled: true,
            }),
          })
        } catch (e) {
          console.log('[v0] Could not save to database:', e)
        }
      } else {
        const isDenied = 'Notification' in window && Notification.permission === 'denied'
        if (isDenied) {
          setMessage('✗ Browser notifications denied - please enable in browser settings')
          setBrowserDenied(true)
        } else {
          setMessage('Browser notifications not available on this browser')
        }
      }
    } catch (error) {
      console.error('[v0] Error requesting browser permission:', error)
      setMessage('Error: Could not enable notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhonePermission = async () => {
    setIsLoading(true)
    setMessage('')
    try {
      console.log('[v0] Requesting phone notification permission...')
      const granted = await requestPhoneNotificationPermission()
      setPhoneEnabled(granted)
      setPhoneDenied(!granted)

      if (granted) {
        console.log('[v0] Phone notifications granted!')
        setMessage('✓ Phone alarms enabled!')

        // Test vibration
        if ('vibrate' in navigator) {
          navigator.vibrate([100])
          console.log('[v0] Vibration triggered')
        }

        // Test alarm sound
        playAlarmSound()

        // Save to database
        try {
          await fetch('/api/notifications/permissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone_notifications_enabled: true,
            }),
          })
        } catch (e) {
          console.log('[v0] Could not save to database:', e)
        }
      } else {
        setMessage('✗ Phone alarms not available on this device or permission denied')
        setPhoneDenied(true)
      }
    } catch (error) {
      console.error('[v0] Error requesting phone permission:', error)
      setMessage('Error: Could not enable phone alarms')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestBrowserNotification = () => {
    console.log('[v0] Testing browser notification, permission:', 'Notification' in window ? Notification.permission : 'N/A')
    if ('Notification' in window && Notification.permission !== 'granted') {
      setMessage('✗ Notifications permission not granted. Please enable notifications first.')
      return
    }
    
    console.log('[v0] Sending test browser notification')
    const result = sendBrowserNotification('Test Notification 🔔', {
      body: 'This is what your study reminders will look like',
      icon: '/icon.svg',
    })
    
    if (result) {
      setMessage('✓ Test notification sent! Check your notification area.')
    } else {
      setMessage('✗ Failed to send notification')
    }
  }

  const handleTestPhoneAlarm = () => {
    console.log('[v0] Testing phone alarm')
    if ('vibrate' in navigator) {
      navigator.vibrate([500, 200, 500, 200, 500, 200, 500])
    }
    playAlarmSound()
    setMessage('✓ Alarm test - you should feel vibrations and hear a sound!')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold">Enable Notifications & Alarms</h3>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg flex items-start gap-2 ${
            message.includes('✓')
              ? 'bg-green-500/10 border border-green-500/30'
              : 'bg-amber-500/10 border border-amber-500/30'
          }`}
        >
          {message.includes('✓') ? (
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${message.includes('✓') ? 'text-green-400' : 'text-amber-400'}`}>
            {message}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Browser Notifications */}
        <Card className="p-4 border-border space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg flex-shrink-0">
              <Bell className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Browser Notifications</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Get desktop alerts for your study reminders
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {browserEnabled ? (
              <div className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Enabled - You will receive notifications
              </div>
            ) : browserDenied ? (
              <div className="text-xs text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Denied - Enable in browser settings to use notifications
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Click below to enable browser notifications
              </p>
            )}
          </div>

          <div className="flex gap-2 flex-col">
            {!browserEnabled && !browserDenied ? (
              <Button
                onClick={handleBrowserPermission}
                disabled={isLoading}
                className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm w-full"
              >
                {isLoading ? 'Enabling...' : 'Enable Notifications'}
              </Button>
            ) : browserEnabled ? (
              <Button
                onClick={handleTestBrowserNotification}
                variant="outline"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-sm w-full bg-transparent"
              >
                Send Test Notification
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground p-2 bg-background/50 rounded text-center">
                Notifications are disabled in your browser settings
              </p>
            )}
          </div>
        </Card>

        {/* Phone Alarms */}
        <Card className="p-4 border-border space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
              <Smartphone className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Phone Alarms</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Get vibrations and sound alarms on your device
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {phoneEnabled ? (
              <div className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Enabled - Alarms will ring and vibrate
              </div>
            ) : phoneDenied ? (
              <div className="text-xs text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Not available or denied on this device
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Click below to enable phone alarms
              </p>
            )}
          </div>

          <div className="flex gap-2 flex-col">
            {!phoneEnabled && !phoneDenied ? (
              <Button
                onClick={handlePhonePermission}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm w-full"
              >
                {isLoading ? 'Enabling...' : 'Enable Phone Alarms'}
              </Button>
            ) : phoneEnabled ? (
              <Button
                onClick={handleTestPhoneAlarm}
                variant="outline"
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-sm w-full bg-transparent"
              >
                Test Alarm (Vibration + Sound)
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground p-2 bg-background/50 rounded text-center">
                Phone alarms not supported on this device
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="p-3 bg-background border border-border rounded-lg text-xs text-muted-foreground space-y-1">
        <p>
          💡 <strong>How it works:</strong> When you enable notifications, automatic alarms will trigger at each study session time in your routine.
        </p>
        <p>
          Both browser and phone alarms will alert you with notifications, vibrations, and sounds.
        </p>
      </div>
    </div>
  )
}

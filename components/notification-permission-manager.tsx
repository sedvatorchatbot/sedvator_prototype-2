"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bell, Smartphone } from "lucide-react"
import {
  requestBrowserNotificationPermission,
  requestPhoneNotificationPermission,
  isBrowserNotificationAvailable,
  isPhoneNotificationAvailable,
} from "@/lib/notifications"

interface NotificationPermissionManagerProps {
  onPermissionsUpdated?: (permissions: any) => void
}

export function NotificationPermissionManager({
  onPermissionsUpdated,
}: NotificationPermissionManagerProps) {
  const [browserEnabled, setBrowserEnabled] = useState(false)
  const [phoneEnabled, setPhoneEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleBrowserPermission = async () => {
    setIsLoading(true)
    try {
      const granted = await requestBrowserNotificationPermission()
      setBrowserEnabled(granted)

      if (granted) {
        // Save to database
        await fetch("/api/notifications/permissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            browser_notifications_enabled: true,
          }),
        })

        onPermissionsUpdated?.({ browser: true, phone: phoneEnabled })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhonePermission = async () => {
    setIsLoading(true)
    try {
      const granted = await requestPhoneNotificationPermission()
      setPhoneEnabled(granted)

      if (granted) {
        // Save to database
        await fetch("/api/notifications/permissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_notifications_enabled: true,
          }),
        })

        onPermissionsUpdated?.({ browser: browserEnabled, phone: true })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Notification Settings</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Browser Notifications */}
        <Card className="p-4 border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-cyan-400 mt-1" />
              <div>
                <h4 className="font-medium">Browser Notifications</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Get alerts in your browser when it's time to study
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleBrowserPermission}
            disabled={isLoading || browserEnabled}
            className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            {browserEnabled ? "Enabled" : "Enable Notifications"}
          </Button>
        </Card>

        {/* Phone Notifications */}
        <Card className="p-4 border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-blue-400 mt-1" />
              <div>
                <h4 className="font-medium">Phone Notifications</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Get phone alarms and notifications when you need to study
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={handlePhonePermission}
            disabled={isLoading || phoneEnabled}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            {phoneEnabled ? "Enabled" : "Enable Phone Notifications"}
          </Button>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Notifications help you stay on track with your study routine. You can
        disable them anytime in your browser settings.
      </p>
    </div>
  )
}

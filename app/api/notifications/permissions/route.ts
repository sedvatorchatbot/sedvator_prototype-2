import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      browser_notifications_enabled,
      phone_notifications_enabled,
    } = body

    // Check if permissions record exists
    const { data: existing } = await supabase
      .from("notification_permissions")
      .select()
      .eq("user_id", user.id)
      .maybeSingle()

    let permissions

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from("notification_permissions")
        .update({
          browser_notifications_enabled:
            browser_notifications_enabled !== undefined
              ? browser_notifications_enabled
              : existing.browser_notifications_enabled,
          phone_notifications_enabled:
            phone_notifications_enabled !== undefined
              ? phone_notifications_enabled
              : existing.phone_notifications_enabled,
          last_permission_requested: new Date().toISOString(),
          permission_granted_at:
            (browser_notifications_enabled || phone_notifications_enabled) &&
            !existing.permission_granted_at
              ? new Date().toISOString()
              : existing.permission_granted_at,
        })
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) throw error
      permissions = data
    } else {
      // Create new
      const { data, error } = await supabase
        .from("notification_permissions")
        .insert({
          user_id: user.id,
          browser_notifications_enabled: browser_notifications_enabled || false,
          phone_notifications_enabled: phone_notifications_enabled || false,
          last_permission_requested: new Date().toISOString(),
          permission_granted_at:
            (browser_notifications_enabled || phone_notifications_enabled) &&
            new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      permissions = data
    }

    return NextResponse.json(permissions)
  } catch (error: any) {
    console.error("Error updating permissions:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update permissions" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: permissions, error } = await supabase
      .from("notification_permissions")
      .select()
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return NextResponse.json(
      permissions || {
        user_id: user.id,
        browser_notifications_enabled: false,
        phone_notifications_enabled: false,
      }
    )
  } catch (error: any) {
    console.error("Error fetching permissions:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch permissions" },
      { status: 500 }
    )
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const routineId = params.id

    console.log('[v0] Deleting routine:', routineId)

    // Get current user
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify routine belongs to user
    const { data: routine, error: routineError } = await supabase
      .from('study_routines')
      .select('id, user_id')
      .eq('id', routineId)
      .single()

    if (routineError || !routine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 })
    }

    if (routine.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete reminders first (foreign key constraint)
    const { error: remindersError } = await supabase
      .from('reminders')
      .delete()
      .eq('routine_id', routineId)

    if (remindersError) {
      console.error('[v0] Error deleting reminders:', remindersError)
      return NextResponse.json(
        { error: 'Failed to delete reminders' },
        { status: 500 }
      )
    }

    // Delete routine sessions
    const { error: sessionsError } = await supabase
      .from('routine_sessions')
      .delete()
      .eq('routine_id', routineId)

    if (sessionsError) {
      console.error('[v0] Error deleting sessions:', sessionsError)
      return NextResponse.json(
        { error: 'Failed to delete sessions' },
        { status: 500 }
      )
    }

    // Delete routine
    const { error: deleteError } = await supabase
      .from('study_routines')
      .delete()
      .eq('id', routineId)

    if (deleteError) {
      console.error('[v0] Error deleting routine:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete routine' },
        { status: 500 }
      )
    }

    console.log('[v0] Routine deleted successfully')

    return NextResponse.json({ success: true, message: 'Routine deleted' })
  } catch (error) {
    console.error('[v0] Error in DELETE route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MockTestHub } from '@/components/mock-test-hub'

export const metadata = {
  title: 'Mock Tests | Sedvator',
  description: 'AI-generated mock tests for CBSE and JEE exams',
}

export default async function MockTestsPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  return <MockTestHub />
}

import { createBrowserClient } from "@supabase/ssr"

let cachedClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return cached client if it exists
  if (cachedClient) {
    return cachedClient
  }

  // Create new client with error handling
  try {
    cachedClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    return cachedClient
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    // Return a dummy client-like object to prevent crashes
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
      },
    } as any
  }
}

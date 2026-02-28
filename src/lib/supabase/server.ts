import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = cookies()

  const getAll =
    typeof (cookieStore as any).getAll === 'function'
      ? () => (cookieStore as any).getAll()
      : () => []

  const setAll = (cookiesToSet: { name: string; value: string; options: any }[]) => {
    try {
      const setFn = (cookieStore as any).set
      if (typeof setFn === 'function') {
        cookiesToSet.forEach(({ name, value, options }) => setFn(name, value, options))
      }
    } catch {
      // Ignore cookie write errors
    }
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll,
        setAll,
      },
    }
  )
}
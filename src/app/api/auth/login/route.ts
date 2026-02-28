import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as {
      email?: string
      password?: string
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const response = NextResponse.json({ user: null })
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    response.headers.set('Content-Type', 'application/json')
    return new NextResponse(JSON.stringify({ user: data.user }), {
      status: 200,
      headers: response.headers,
    })
  } catch (err) {
    console.error('Auth login route error', err)
    const message =
      err instanceof Error ? err.message : 'Unexpected error while logging in.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


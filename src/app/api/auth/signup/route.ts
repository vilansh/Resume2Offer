import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = (await req.json()) as {
      email?: string
      password?: string
      fullName?: string
    }

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Full name, email and password are required.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user: data.user })
  } catch (err) {
    console.error('Auth signup route error', err)
    const message =
      err instanceof Error ? err.message : 'Unexpected error while signing up.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


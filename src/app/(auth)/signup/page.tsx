'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Account created!')
    window.location.href = '/dashboard'
  }

  return (
    <div style={{ width: '100%', maxWidth: '420px', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 className="font-serif" style={{ fontSize: '28px', fontWeight: 400, marginBottom: '8px', color: '#C9A84C' }}>
          Resume2Offer
        </h1>
        <p style={{ color: '#625D78', fontSize: '14px' }}>Create your free account</p>
      </div>

      <div style={{ background: '#0E0D10', border: '1px solid #1E1C26', borderRadius: '16px', padding: '32px' }}>
        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#A09BB8', marginBottom: '8px' }}>
              Full name
            </label>
            <input className="input" type="text" placeholder="Arjun Mehta"
              value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#A09BB8', marginBottom: '8px' }}>
              Email address
            </label>
            <input className="input" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#A09BB8', marginBottom: '8px' }}>
              Password
            </label>
            <input className="input" type="password" placeholder="Min 6 characters"
              value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating account...' : 'Create Free Account →'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#1E1C26' }} />
          <span style={{ fontSize: '12px', color: '#3D394F' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#1E1C26' }} />
        </div>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#625D78' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#C9A84C', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>

      <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
        <Link href="/" style={{ color: '#625D78', textDecoration: 'none' }}>← Back to home</Link>
      </p>
    </div>
  )
}

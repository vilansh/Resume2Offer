'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        toast.error(body.error || 'Could not sign in. Please check your details.')
        setLoading(false)
        return
      }

      toast.success('Welcome back!')
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('Login error', err)
      toast.error('Network error while signing in. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '420px',
      padding: '0 24px',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 className="font-serif gold-text-static" style={{
          fontSize: '28px',
          fontWeight: 400,
          marginBottom: '8px',
        }}>
          Resume2Offer
        </h1>
        <p style={{ color: 'var(--color-text-3)', fontSize: '14px' }}>
          Sign in to your account
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '32px',
      }}>
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-text-2)',
              marginBottom: '8px',
              fontFamily: 'var(--font-dm)',
            }}>
              Email address
            </label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-text-2)',
              marginBottom: '8px',
              fontFamily: 'var(--font-dm)',
            }}>
              Password
            </label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '24px 0',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          <span style={{ fontSize: '12px', color: 'var(--color-text-4)' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        </div>

        {/* Signup link */}
        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: 'var(--color-text-3)',
        }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{
            color: 'var(--color-gold)',
            textDecoration: 'none',
            fontWeight: 500,
          }}>
            Sign up free
          </Link>
        </p>
      </div>

      {/* Back to home */}
      <p style={{
        textAlign: 'center',
        marginTop: '24px',
        fontSize: '13px',
        color: 'var(--color-text-4)',
      }}>
        <Link href="/" style={{
          color: 'var(--color-text-3)',
          textDecoration: 'none',
        }}>
          ← Back to home
        </Link>
      </p>
    </div>
  )
}
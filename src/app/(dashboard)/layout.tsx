'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  User2,
  Sparkles,
  Files,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Profile', href: '/profile', icon: User2 },
  { label: 'Generate', href: '/generate', icon: Sparkles },
  { label: 'My Resumes', href: '/resumes', icon: Files },
]

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [loadingLogout, setLoadingLogout] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth
      .getUser()
      .then(({ data }) => {
        setEmail(data.user?.email ?? null)
      })
      .catch(() => {
        setEmail(null)
      })
  }, [])

  async function handleLogout() {
    try {
      setLoadingLogout(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch {
      setLoadingLogout(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-base)] text-[var(--color-text-1)]">
      {/* Sidebar */}
      <aside className="sidebar hidden md:flex">
        {/* Logo */}
        <div style={{ marginBottom: '32px', padding: '4px 8px' }}>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div
              className="rounded-full"
              style={{
                width: 32,
                height: 32,
                background:
                  'radial-gradient(circle at 30% 0, rgba(201,168,76,0.55), transparent 55%), var(--color-surface-3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 0 1px rgba(201,168,76,0.25)',
              }}
            >
              <Sparkles size={16} className="text-[var(--color-gold)]" />
            </div>
            <span
              className="font-serif gold-text-static"
              style={{ fontSize: 20 }}
            >
              Resume2Offer
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map(item => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'sidebar-link',
                  active && 'sidebar-link active'
                )}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User / logout */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 16,
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: 'var(--color-text-3)',
              wordBreak: 'break-all',
            }}
          >
            {email ?? 'Loading account...'}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loadingLogout}
            className="sidebar-link"
            style={{
              justifyContent: 'flex-start',
              opacity: loadingLogout ? 0.7 : 1,
            }}
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[rgba(8,8,9,0.96)] backdrop-blur-xl">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-serif gold-text-static text-lg">
            Resume2Offer
          </span>
        </Link>
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-3)]">
          <span>{email ?? 'Account'}</span>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loadingLogout}
            className="btn-secondary"
            style={{
              paddingInline: 10,
              paddingBlock: 6,
              fontSize: 11,
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="md:ml-[240px] min-h-screen px-4 md:px-8 py-6 md:py-10">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}

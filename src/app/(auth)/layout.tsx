import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="hero-bg min-h-screen flex items-center justify-center"
      style={{
        padding: '32px 16px',
      }}
    >
      {children}
    </div>
  )
}
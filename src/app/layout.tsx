import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Resume2Offer — AI Resume Tailoring',
  description: 'Upload once. Tailor infinitely. Apply faster.',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1020',
              border: '1px solid #2D1F3D',
              color: '#F5F0FF',
            },
          }}
        />
      </body>
    </html>
  )
}
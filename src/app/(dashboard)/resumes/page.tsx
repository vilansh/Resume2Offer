'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDate, getATSColor, getATSLabel } from '@/lib/utils'
import { Search } from 'lucide-react'

type ResumeRow = {
  id: string
  job_title: string | null
  company_name: string | null
  ats_score: number | null
  created_at: string | null
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState<ResumeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('resumes')
          .select('id, job_title, company_name, ats_score, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading resumes', error)
        } else {
          setResumes((data || []) as ResumeRow[])
        }
      } catch (err) {
        console.error('Unexpected error loading resumes', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) return resumes
    return resumes.filter(r => {
      const title = (r.job_title || '').toLowerCase()
      const company = (r.company_name || '').toLowerCase()
      return title.includes(term) || company.includes(term)
    })
  }, [resumes, search])

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-3)]">
          My resumes
        </p>
        <h1 className="text-title">Every tailored resume, in one place.</h1>
        <p className="max-w-2xl text-sm md:text-base text-[var(--color-text-2)]">
          Search, revisit and download any resume you&apos;ve generated. Use them as templates for
          future roles.
        </p>
      </header>

      <div className="card p-4 flex items-center gap-3">
        <Search size={16} className="text-[var(--color-text-4)]" />
        <input
          className="input"
          placeholder="Search by job title or company…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-4">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-3 w-20" />
              <div className="skeleton h-20 w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-sm text-[var(--color-text-3)]">
          No resumes yet. Generate your first one from the{' '}
          <Link
            href="/generate"
            className="text-[var(--color-gold)] underline-offset-4 hover:underline"
          >
            Generate
          </Link>{' '}
          tab.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {filtered.map(r => {
            const score = r.ats_score ?? 0
            const color = getATSColor(score)
            const label = getATSLabel(score)

            return (
              <Link
                key={r.id}
                href={`/resumes/${r.id}`}
                className="card p-5 flex flex-col justify-between hover:border-[var(--color-gold-muted)] transition-colors"
              >
                <div className="mb-4 space-y-1.5">
                  <p className="text-sm font-medium text-[var(--color-text-1)]">
                    {r.job_title || 'Untitled role'}
                  </p>
                  <p className="text-xs text-[var(--color-text-3)]">
                    {r.company_name || 'Company not set'}
                  </p>
                </div>
                <div className="flex items-end justify-between gap-4">
                  <div className="score-ring">
                    <svg width="70" height="70">
                      <circle
                        cx="35"
                        cy="35"
                        r="28"
                        stroke="rgba(55,49,80,0.9)"
                        strokeWidth="5"
                        fill="none"
                      />
                      <circle
                        cx="35"
                        cy="35"
                        r="28"
                        stroke={color}
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${(score / 100) * 2 * Math.PI * 28} ${
                          2 * Math.PI * 28
                        }`}
                      />
                    </svg>
                    <div className="score-value" style={{ fontSize: 20 }}>
                      {score}
                    </div>
                  </div>
                  <div className="flex-1 text-right text-[11px] text-[var(--color-text-3)] space-y-1">
                    <div>
                      <span
                        className="badge"
                        style={{
                          borderColor: color,
                          color,
                          background: 'rgba(0,0,0,0.16)',
                        }}
                      >
                        {label}
                      </span>
                    </div>
                    <p>
                      Created{' '}
                      {r.created_at ? formatDate(r.created_at) : 'recently'}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowRight, FileText, PlusCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getATSColor, getATSLabel } from '@/lib/utils'

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-3)] mb-2">
            Dashboard
          </p>
          <h1 className="text-title">
            Good morning, <span className="gold-text-static">there</span>.
          </h1>
          <p className="mt-2 text-sm md:text-base text-[var(--color-text-2)] max-w-xl">
            Track your ATS performance and spin up tailored resumes for every JD in your pipeline.
          </p>
        </div>
        <Link href="/generate" className="btn-primary flex items-center justify-center gap-2">
          <PlusCircle size={18} />
          Generate New Resume
        </Link>
      </header>

      <Suspense fallback={<DashboardSkeleton />}>
        {/* @ts-expect-error Async Server Component */}
        <DashboardContent />
      </Suspense>
    </section>
  )
}

async function DashboardContent() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: resumes, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching resumes', error)
  }

  const list = resumes ?? []

  const totalResumes = list.length
  const atsScores = list.map(r => r.ats_score as number).filter(Boolean)
  const avgATS =
    atsScores.length > 0
      ? Math.round(atsScores.reduce((a, b) => a + b, 0) / atsScores.length)
      : 0
  const bestScore = atsScores.length > 0 ? Math.max(...atsScores) : 0

  const thisWeek = list.filter(r => {
    const created = new Date(r.created_at as string)
    const now = new Date()
    const diff = now.getTime() - created.getTime()
    return diff <= 7 * 24 * 60 * 60 * 1000
  }).length

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid gap-5 md:grid-cols-4">
        <div className="stat-card">
          <p className="stat-label mb-1">Total Resumes</p>
          <div className="stat-number">{totalResumes}</div>
        </div>
        <div className="stat-card">
          <p className="stat-label mb-1">Avg ATS Score</p>
          <div className="stat-number">
            {avgATS}
            <span className="ml-1 text-sm text-[var(--color-text-3)]">/100</span>
          </div>
        </div>
        <div className="stat-card">
          <p className="stat-label mb-1">Best Score</p>
          <div className="stat-number">
            {bestScore}
            <span className="ml-1 text-sm text-[var(--color-text-3)]">/100</span>
          </div>
        </div>
        <div className="stat-card">
          <p className="stat-label mb-1">This Week</p>
          <div className="stat-number">{thisWeek}</div>
        </div>
      </div>

      {/* Recent resumes */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <div>
            <p className="text-sm font-medium text-[var(--color-text-1)]">
              Recent resumes
            </p>
            <p className="text-xs text-[var(--color-text-3)]">
              Your latest tailored resumes with ATS scores.
            </p>
          </div>
          <Link href="/resumes" className="btn-link text-[var(--color-violet)]">
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-[var(--color-text-3)]">
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
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-[0.16em] text-[var(--color-text-3)]">
                  <th className="px-4 py-3 text-left font-normal">Job title</th>
                  <th className="px-4 py-3 text-left font-normal">Company</th>
                  <th className="px-4 py-3 text-left font-normal">ATS score</th>
                  <th className="px-4 py-3 text-left font-normal">Created</th>
                  <th className="px-4 py-3 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(r => {
                  const score = (r.ats_score as number) ?? 0
                  const color = getATSColor(score)
                  const label = getATSLabel(score)

                  return (
                    <tr
                      key={r.id as string}
                      className="border-b border-[var(--color-border)] last:border-0 hover:bg-[rgba(19,18,24,0.85)]"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-[var(--color-text-1)]">
                          {r.job_title || 'Untitled role'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-2)]">
                        {r.company_name || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="badge"
                          style={{
                            borderColor: color,
                            color,
                            background: 'rgba(0,0,0,0.16)',
                          }}
                        >
                          {score}/100 · {label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-3)]">
                        {r.created_at ? formatDate(r.created_at as string) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/resumes/${r.id}`}
                          className="btn-secondary inline-flex items-center gap-2 text-xs"
                          style={{ paddingInline: 12, paddingBlock: 6 }}
                        >
                          <FileText size={14} />
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card">
            <div className="skeleton h-3 w-20 mb-3" />
            <div className="skeleton h-7 w-24" />
          </div>
        ))}
      </div>
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="skeleton h-4 w-40" />
          <div className="skeleton h-8 w-28" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-9 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

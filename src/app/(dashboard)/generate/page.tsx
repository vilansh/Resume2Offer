'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { JDAnalysis } from '@/types/jd'
import type { ATSBreakdown } from '@/types/resume'
import { getATSColor, getATSLabel } from '@/lib/utils'
import { ArrowRight, Loader2 } from 'lucide-react'

type Step = 'idle' | 'analyzing' | 'tailoring' | 'scoring'

export default function GeneratePage() {
  const router = useRouter()
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jdText, setJdText] = useState('')

  const [step, setStep] = useState<Step>('idle')
  const [loading, setLoading] = useState(false)

  const [jdAnalysis, setJdAnalysis] = useState<JDAnalysis | null>(null)
  const [atsScore, setAtsScore] = useState<number | null>(null)
  const [atsBreakdown, setAtsBreakdown] = useState<ATSBreakdown | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [missing, setMissing] = useState<string[]>([])

  const scoreColor = atsScore != null ? getATSColor(atsScore) : 'var(--color-text-4)'
  const scoreLabel = atsScore != null ? getATSLabel(atsScore) : 'Not scored yet'

  async function handleGenerate() {
    if (!jdText.trim() || !jobTitle.trim()) {
      toast.error('Please enter both job title and job description.')
      return
    }

    try {
      setLoading(true)
      setStep('analyzing')

      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        toast.error('You are not logged in. Please sign in again.')
        setLoading(false)
        setStep('idle')
        return
      }

      // 1. Analyze JD
      const analyzeRes = await fetch('/api/analyze-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jdText,
          jobTitle,
          company,
        }),
      })

      if (!analyzeRes.ok) {
        const msg = await analyzeRes.text()
        console.error('Analyze JD error', msg)
        toast.error('Could not analyze job description. Please try again.')
        setStep('idle')
        setLoading(false)
        return
      }

      const analysis = (await analyzeRes.json()) as JDAnalysis
      setJdAnalysis(analysis)

      // 2. Generate resume
      setStep('tailoring')
      const generateRes = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          jdAnalysis: analysis,
        }),
      })

      if (!generateRes.ok) {
        const msg = await generateRes.text()
        console.error('Generate resume error', msg)
        toast.error('Could not generate resume. Please try again.')
        setStep('idle')
        setLoading(false)
        return
      }

      setStep('scoring')
      const payload = (await generateRes.json()) as {
        resumeId: string
        atsScore: number
        atsBreakdown: ATSBreakdown
        matched: string[]
        missing: string[]
      }

      setAtsScore(payload.atsScore)
      setAtsBreakdown(payload.atsBreakdown)
      setMatched(payload.matched)
      setMissing(payload.missing)

      toast.success('Tailored resume ready')
      router.push(`/resumes/${payload.resumeId}`)
    } catch (err) {
      console.error('Generate flow error', err)
      toast.error('Unexpected error while generating resume')
      setStep('idle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-3)]">
          Generator
        </p>
        <h1 className="text-title">Turn any JD into a one-page, ATS-ready resume.</h1>
        <p className="max-w-2xl text-sm md:text-base text-[var(--color-text-2)]">
          Paste the job description on the left. Watch the ATS score, keyword match and context fit
          update on the right as we tailor your resume.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start">
        {/* Left column */}
        <div className="card p-5 space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-3)] mb-1">
                Company name
              </label>
              <input
                className="input"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="E.g. Razorpay, Swiggy, Freshworks…"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-3)] mb-1">
                Job title
              </label>
              <input
                className="input"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="Senior Backend Engineer, PM, Data Scientist…"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-3)] mb-1">
              Job description
            </label>
            <textarea
              className="input"
              rows={16}
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              placeholder="Paste the full job description from LinkedIn, Naukri or the company careers page…"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[var(--color-text-4)]">
              We don&apos;t share this JD with anyone else. It&apos;s used only to generate your
              tailored resume.
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  {step === 'analyzing'
                    ? 'Analyzing job description…'
                    : step === 'tailoring'
                    ? 'Tailoring your resume…'
                    : 'Calculating ATS score…'}
                </>
              ) : (
                <>
                  Generate Resume
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right column – ATS card */}
        <div className="card-gold p-5 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-3)] mb-1">
                ATS score
              </p>
              <p className="text-sm text-[var(--color-text-2)]">
                Higher scores correlate with better chances of clearing automated filters.
              </p>
            </div>
            <div className="score-ring">
              <svg width="90" height="90">
                <circle
                  cx="45"
                  cy="45"
                  r="36"
                  stroke="rgba(55,49,80,0.9)"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="45"
                  cy="45"
                  r="36"
                  stroke={scoreColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={
                    atsScore != null
                      ? `${(atsScore / 100) * 2 * Math.PI * 36} ${2 * Math.PI * 36}`
                      : `0 ${2 * Math.PI * 36}`
                  }
                />
              </svg>
              <div className="score-value">
                {atsScore != null ? atsScore : '--'}
              </div>
            </div>
          </div>

          <p className="text-xs text-[var(--color-text-3)]">
            {atsScore != null
              ? `Overall: ${scoreLabel}. Must-have skills, good-to-have skills and contextual keywords are all factored in.`
              : 'Run a generation to see your ATS score and a breakdown of what to improve.'}
          </p>

          <div className="space-y-3 text-xs text-[var(--color-text-3)]">
            <ProgressRow
              label="Must-have skills"
              value={atsBreakdown?.mustHaveScore ?? 0}
              tone="gold"
            />
            <ProgressRow
              label="Good-to-have"
              value={atsBreakdown?.goodToHaveScore ?? 0}
              tone="emerald"
            />
            <ProgressRow
              label="Context & keywords"
              value={atsBreakdown?.contextScore ?? 0}
              tone="violet"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 text-xs">
            <div>
              <p className="mb-1 text-[var(--color-text-3)]">Matched keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {(matched.length ? matched : jdAnalysis?.mustHaveSkills || []).map(term => (
                  <span
                    key={term}
                    className="badge"
                    style={{
                      borderColor: 'var(--color-emerald-muted)',
                      background: 'var(--color-emerald-subtle)',
                      color: 'var(--color-emerald)',
                    }}
                  >
                    {term}
                  </span>
                ))}
                {!matched.length && !jdAnalysis && (
                  <span className="text-[var(--color-text-4)]">
                    Will appear after you run a generation.
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="mb-1 text-[var(--color-text-3)]">Missing keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {(missing.length ? missing : jdAnalysis?.goodToHaveSkills || []).map(term => (
                  <span
                    key={term}
                    className="badge"
                    style={{
                      borderColor: 'var(--color-error)',
                      background: 'rgba(224,82,82,0.15)',
                      color: 'var(--color-error)',
                    }}
                  >
                    {term}
                  </span>
                ))}
                {!missing.length && !jdAnalysis && (
                  <span className="text-[var(--color-text-4)]">
                    We&apos;ll highlight skills that are missing from your profile.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-border-2)] bg-[rgba(12,11,18,0.9)] px-4 py-3 text-[10px] text-[var(--color-text-3)]">
            <p className="font-medium mb-1 text-[var(--color-text-2)]">
              What happens when you click &quot;Generate Resume&quot;?
            </p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>We analyze the JD for seniority, must-haves and domain context.</li>
              <li>We tailor a one-page resume from your master profile.</li>
              <li>We score the draft and surface matched &amp; missing keywords.</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProgressRow({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'gold' | 'emerald' | 'violet'
}) {
  const fillClass =
    tone === 'emerald'
      ? 'progress-fill-emerald'
      : tone === 'violet'
      ? 'bg-[var(--color-violet)]'
      : 'progress-fill-gold'

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="progress-track">
        <div className={fillClass} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

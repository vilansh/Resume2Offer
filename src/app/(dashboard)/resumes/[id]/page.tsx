'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { TailoredResume, ATSBreakdown } from '@/types/resume'
import type { JDAnalysis } from '@/types/jd'
import { calculateATSScore } from '@/lib/ats/scorer'
import { getATSColor, getATSLabel, formatDate } from '@/lib/utils'
import { Download } from 'lucide-react'

type ResumeRow = {
  id: string
  job_title: string | null
  company_name: string | null
  jd_analysis: JDAnalysis | null
  tailored_json: TailoredResume | null
  ats_score: number | null
  ats_breakdown: ATSBreakdown | null
  created_at: string | null
}

export default function ResumeDetailPage() {
  const params = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [row, setRow] = useState<ResumeRow | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [missing, setMissing] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const id = params?.id
      if (!id) return

      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          console.error('Error loading resume', error)
          toast.error('Could not load resume. Please try again.')
          return
        }

        const typed: ResumeRow = {
          id: data.id as string,
          job_title: data.job_title as string | null,
          company_name: data.company_name as string | null,
          jd_analysis: (data.jd_analysis as JDAnalysis) ?? null,
          tailored_json: (data.tailored_json as TailoredResume) ?? null,
          ats_score: (data.ats_score as number | null) ?? null,
          ats_breakdown: (data.ats_breakdown as ATSBreakdown | null) ?? null,
          created_at: data.created_at as string | null,
        }

        if (typed.tailored_json && typed.jd_analysis) {
          const ats = calculateATSScore(typed.tailored_json, typed.jd_analysis)
          setMatched(ats.matched)
          setMissing(ats.missing)
          // Prefer stored numbers if present, but fall back to re-computed
          typed.ats_score = typed.ats_score ?? ats.finalScore
          typed.ats_breakdown = typed.ats_breakdown ?? ats.breakdown
        }

        setRow(typed)
      } catch (err) {
        console.error('Unexpected error loading resume', err)
        toast.error('Unexpected error while loading resume')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [params])

  async function handleDownload() {
    try {
      const element = document.getElementById('resume-paper')
      if (!element) {
        toast.error('Could not find resume content to export.')
        return
      }

      // Touch the API route for consistency, even though export is client-side
      await fetch('/api/export-pdf', { method: 'POST' }).catch(() => {})

      const html2pdf = (await import('html2pdf.js')).default
      const filename =
        (row?.job_title || 'resume') +
        (row?.company_name ? `-${row.company_name}` : '') +
        '.pdf'

      html2pdf()
        .from(element)
        .set({
          margin: [12, 12, 12, 12],
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
        })
        .save()
    } catch (err) {
      console.error('Export error', err)
      toast.error('Could not generate PDF in this browser.')
    }
  }

  if (loading) {
    return (
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
        <div className="card p-6">
          <div className="skeleton h-6 w-48 mb-4" />
          <div className="skeleton h-[520px] w-full" />
        </div>
        <div className="card p-6 space-y-4">
          <div className="skeleton h-4 w-40" />
          <div className="skeleton h-32 w-full" />
          <div className="skeleton h-32 w-full" />
        </div>
      </section>
    )
  }

  if (!row || !row.tailored_json) {
    return (
      <section className="card p-8 text-center text-sm text-[var(--color-text-3)]">
        This resume could not be found. It may have been deleted or never generated.
      </section>
    )
  }

  const score = row.ats_score ?? 0
  const breakdown = row.ats_breakdown ?? {
    mustHaveScore: 0,
    goodToHaveScore: 0,
    contextScore: 0,
  }
  const scoreColor = getATSColor(score)
  const scoreLabel = getATSLabel(score)

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] items-start">
      {/* Left: rendered resume */}
      <div className="card p-4 lg:p-6 bg-[var(--color-surface-2)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-3)]">
              Tailored resume
            </p>
            <p className="text-sm text-[var(--color-text-2)]">
              {row.job_title || 'Untitled role'}{' '}
              {row.company_name ? `· ${row.company_name}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="btn-primary flex items-center gap-2"
            style={{ paddingInline: 14, paddingBlock: 8, fontSize: 12 }}
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>

        <div id="resume-paper" className="resume-paper bg-white text-black">
          <ResumePaper resume={row.tailored_json} />
        </div>
      </div>

      {/* Right: ATS panel */}
      <div className="space-y-4">
        <div className="card-gold p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-3)] mb-1">
                ATS overview
              </p>
              <p className="text-sm text-[var(--color-text-2)]">
                {row.created_at
                  ? `Generated on ${formatDate(row.created_at)}`
                  : 'Generated recently'}
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-3)]">
                Higher scores tend to clear screening bots on major Indian job boards.
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
                  strokeDasharray={`${(score / 100) * 2 * Math.PI * 36} ${
                    2 * Math.PI * 36
                  }`}
                />
              </svg>
              <div className="score-value">{score}</div>
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-3)]">
            Overall: <span style={{ color: scoreColor }}>{scoreLabel}</span>. Must-have skills carry
            the most weight, followed by good-to-haves and contextual keywords from the JD.
          </p>
          <div className="space-y-3 text-xs text-[var(--color-text-3)]">
            <ProgressRow label="Must-have skills" value={breakdown.mustHaveScore} tone="gold" />
            <ProgressRow label="Good-to-have" value={breakdown.goodToHaveScore} tone="emerald" />
            <ProgressRow label="Context & keywords" value={breakdown.contextScore} tone="violet" />
          </div>
        </div>

        <div className="card p-5 space-y-4 text-xs">
          <div>
            <p className="mb-1 text-[var(--color-text-3)]">Matched keywords</p>
            <div className="flex flex-wrap gap-1.5">
              {matched.length ? (
                matched.map(term => (
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
                ))
              ) : (
                <span className="text-[var(--color-text-4)]">
                  No matched keywords detected for this resume.
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="mb-1 text-[var(--color-text-3)]">Missing keywords</p>
            <div className="flex flex-wrap gap-1.5">
              {missing.length ? (
                missing.map(term => (
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
                ))
              ) : (
                <span className="text-[var(--color-text-4)]">
                  This draft already covers most JD keywords. Nice.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ResumePaper({ resume }: { resume: TailoredResume }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid #e5e5e5',
          paddingBottom: 10,
          marginBottom: 6,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: 0.2,
            }}
          >
            {resume.personalInfo.name}
          </h1>
          <p style={{ fontSize: 11, marginTop: 3 }}>{resume.summary}</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: 10, lineHeight: 1.5 }}>
          <div>{resume.personalInfo.location}</div>
          <div>{resume.personalInfo.email}</div>
          <div>{resume.personalInfo.phone}</div>
          {resume.personalInfo.linkedin && <div>{resume.personalInfo.linkedin}</div>}
        </div>
      </header>

      {/* Experience */}
      {resume.experience.length > 0 && (
        <section>
          <SectionTitle>EXPERIENCE</SectionTitle>
          {resume.experience.map(exp => (
            <div key={`${exp.company}-${exp.title}`} style={{ marginBottom: 8 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                <span>
                  {exp.title} · {exp.company}
                </span>
                <span>{exp.duration}</span>
              </div>
              <ul style={{ margin: '3px 0 0 16px', padding: 0, fontSize: 10 }}>
                {exp.bullets.map(bullet => (
                  <li key={bullet} style={{ marginBottom: 2 }}>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {(resume.skills.primary.length || resume.skills.secondary.length) && (
        <section>
          <SectionTitle>SKILLS</SectionTitle>
          {resume.skills.primary.length > 0 && (
            <p style={{ fontSize: 10, marginBottom: 2 }}>
              <strong>Key:</strong> {resume.skills.primary.join(' · ')}
            </p>
          )}
          {resume.skills.secondary.length > 0 && (
            <p style={{ fontSize: 10 }}>
              <strong>Additional:</strong> {resume.skills.secondary.join(' · ')}
            </p>
          )}
        </section>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <section>
          <SectionTitle>EDUCATION</SectionTitle>
          {resume.education.map(ed => (
            <div
              key={`${ed.institution}-${ed.degree}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 10,
                marginBottom: 3,
              }}
            >
              <span>
                {ed.degree} · {ed.institution}
              </span>
              <span>
                {ed.year}
                {ed.cgpa ? ` · CGPA ${ed.cgpa}` : ''}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {resume.projects.length > 0 && (
        <section>
          <SectionTitle>PROJECTS</SectionTitle>
          {resume.projects.map(project => (
            <div key={project.name} style={{ marginBottom: 6 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  fontSize: 10,
                }}
              >
                <span style={{ fontWeight: 600 }}>{project.name}</span>
                {project.techStack.length > 0 && (
                  <span>{project.techStack.join(', ')}</span>
                )}
              </div>
              <ul style={{ margin: '2px 0 0 16px', padding: 0, fontSize: 10 }}>
                {project.bullets.map(bullet => (
                  <li key={bullet} style={{ marginBottom: 2 }}>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {resume.certifications.length > 0 && (
        <section>
          <SectionTitle>CERTIFICATIONS</SectionTitle>
          <ul style={{ margin: '2px 0 0 16px', padding: 0, fontSize: 10 }}>
            {resume.certifications.map(cert => (
              <li key={cert} style={{ marginBottom: 2 }}>
                {cert}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 11,
        letterSpacing: 1.2,
        fontWeight: 700,
        borderBottom: '1px solid #e5e5e5',
        paddingBottom: 2,
        marginBottom: 4,
      }}
    >
      {children}
    </h2>
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

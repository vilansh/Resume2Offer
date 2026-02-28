'use client'

import { useEffect, useMemo, useState } from 'react'
import { Upload, Plus, Trash2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type {
  WorkExperience,
  Education,
  Project,
  Skills,
  MasterProfile,
} from '@/types/profile'
import { generateId } from '@/lib/utils'

type ProfileForm = {
  fullName: string
  email: string
  phone: string
  location: string
  linkedinUrl: string
  summary: string
  experience: WorkExperience[]
  education: Education[]
  skills: Skills
  projects: Project[]
  certifications: string[]
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [rawResumeText, setRawResumeText] = useState('')
  const [profileId, setProfileId] = useState<string | null>(null)

  const [form, setForm] = useState<ProfileForm>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    summary: '',
    experience: [],
    education: [],
    skills: { technical: [], soft: [] },
    projects: [],
    certifications: [],
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error loading profile', error)
          setLoading(false)
          return
        }

        setProfileId(data.id as string)
        setForm({
          fullName: (data.full_name as string) || '',
          email: (data.email as string) || user.email || '',
          phone: (data.phone as string) || '',
          location: (data.location as string) || '',
          linkedinUrl: (data.linkedin_url as string) || '',
          summary: (data.summary as string) || '',
          experience: (data.experience as WorkExperience[]) || [],
          education: (data.education as Education[]) || [],
          skills: (data.skills as Skills) || { technical: [], soft: [] },
          projects: (data.projects as Project[]) || [],
          certifications: (data.certifications as string[]) || [],
        })
        setRawResumeText((data.raw_resume_text as string) || '')
      } catch (err) {
        console.error('Error initialising profile', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const completion = useMemo(() => {
    let score = 0
    const checks = [
      !!form.fullName,
      !!form.summary,
      form.experience.length > 0,
      form.education.length > 0,
      form.skills.technical.length > 0,
      form.projects.length > 0,
    ]
    const per = 100 / checks.length
    checks.forEach(ok => {
      if (ok) score += per
    })
    return Math.round(score)
  }, [form])

  async function handleSave() {
    if (!profileId) {
      toast.error('Profile not initialised yet')
      return
    }

    try {
      setSaving(true)
      const supabase = createClient()

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: form.fullName,
          email: form.email,
          phone: form.phone,
          location: form.location,
          linkedin_url: form.linkedinUrl,
          summary: form.summary,
          experience: form.experience,
          education: form.education,
          skills: form.skills,
          projects: form.projects,
          certifications: form.certifications,
          raw_resume_text: rawResumeText,
        })
        .eq('id', profileId)

      if (error) {
        console.error('Error saving profile', error)
        toast.error('Could not save profile. Please try again.')
        return
      }

      toast.success('Profile saved')
    } catch (err) {
      console.error('Error saving profile', err)
      toast.error('Unexpected error while saving profile')
    } finally {
      setSaving(false)
    }
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setParsing(true)
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('Parse resume error', text)
        toast.error('Could not parse resume. Please try a different PDF.')
        return
      }

      const data = (await res.json()) as { profile: MasterProfile; rawText?: string }

      const p = data.profile
      setForm({
        fullName: p.fullName || form.fullName,
        email: p.email || form.email,
        phone: p.phone || form.phone,
        location: p.location || form.location,
        linkedinUrl: p.linkedinUrl || form.linkedinUrl,
        summary: p.summary || form.summary,
        experience: p.experience || form.experience,
        education: p.education || form.education,
        skills: p.skills || form.skills,
        projects: p.projects || form.projects,
        certifications: p.certifications || form.certifications,
      })
      if (p.rawResumeText) {
        setRawResumeText(p.rawResumeText)
      }
      toast.success('Resume parsed and profile updated')
    } catch (err) {
      console.error('Upload error', err)
      toast.error('Unexpected error while parsing resume')
    } finally {
      setParsing(false)
    }
  }

  function updateExperience(index: number, patch: Partial<WorkExperience>) {
    setForm(prev => {
      const next = [...prev.experience]
      next[index] = { ...next[index], ...patch }
      return { ...prev, experience: next }
    })
  }

  function addExperience() {
    const blank: WorkExperience = {
      id: generateId(),
      company: '',
      title: '',
      startDate: '',
      endDate: '',
      location: '',
      current: false,
      bullets: [],
    }
    setForm(prev => ({ ...prev, experience: [...prev.experience, blank] }))
  }

  function removeExperience(index: number) {
    setForm(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }))
  }

  function updateEducation(index: number, patch: Partial<Education>) {
    setForm(prev => {
      const next = [...prev.education]
      next[index] = { ...next[index], ...patch }
      return { ...prev, education: next }
    })
  }

  function addEducation() {
    const blank: Education = {
      id: generateId(),
      degree: '',
      institution: '',
      year: '',
      cgpa: '',
    }
    setForm(prev => ({ ...prev, education: [...prev.education, blank] }))
  }

  function removeEducation(index: number) {
    setForm(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }))
  }

  function updateProject(index: number, patch: Partial<Project>) {
    setForm(prev => {
      const next = [...prev.projects]
      next[index] = { ...next[index], ...patch }
      return { ...prev, projects: next }
    })
  }

  function addProject() {
    const blank: Project = {
      id: generateId(),
      name: '',
      description: '',
      techStack: [],
      bullets: [],
      link: '',
    }
    setForm(prev => ({ ...prev, projects: [...prev.projects, blank] }))
  }

  function removeProject(index: number) {
    setForm(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-52" />
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-64 w-full" />
      </div>
    )
  }

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-3)]">
          Master profile
        </p>
        <h1 className="text-title">Give the AI something exceptional to work with.</h1>
        <p className="max-w-2xl text-sm md:text-base text-[var(--color-text-2)]">
          Upload your current resume, clean up the parsed data, and keep this profile updated. Every
          tailored resume will be generated from here.
        </p>
      </header>

      {/* Completion */}
      <div className="card p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-3)] mb-1">
            Completion
          </p>
          <p className="text-sm text-[var(--color-text-2)]">
            Aim for at least 80% before generating your first tailored resume.
          </p>
        </div>
        <div className="w-full md:w-64">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[var(--color-text-3)]">Profile completeness</span>
            <span className="text-[var(--color-text-1)]">{completion}%</span>
          </div>
          <div className="progress-track h-2">
            <div
              className="progress-fill-gold"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      {/* Upload + personal info */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Upload */}
        <div className="card p-5 flex flex-col gap-4">
          <p className="text-sm font-medium text-[var(--color-text-1)]">
            Upload your current resume (PDF)
          </p>
          <p className="text-xs text-[var(--color-text-3)]">
            We&apos;ll parse the content into structured sections. You can tweak everything before
            saving.
          </p>
          <label
            className="mt-1 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--color-border-2)] bg-[rgba(12,11,18,0.6)] px-4 py-8 text-center cursor-pointer hover:border-[var(--color-gold-muted)]"
          >
            <Upload size={22} className="text-[var(--color-gold)]" />
            <div className="text-xs text-[var(--color-text-2)]">
              <span className="font-medium text-[var(--color-text-1)]">
                Drop your resume here
              </span>{' '}
              or click to browse (PDF only)
            </div>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleResumeUpload}
              className="hidden"
            />
          </label>
          <p className="text-xs text-[var(--color-text-4)]">
            {parsing
              ? 'Parsing resume… This may take a few seconds.'
              : 'Parsing happens on secure servers. We store only the structured profile, not the raw PDF.'}
          </p>
        </div>

        {/* Personal info */}
        <div className="card p-5 space-y-4">
          <p className="text-sm font-medium text-[var(--color-text-1)]">
            Personal information
          </p>
          <div className="grid gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-3)] mb-1">
                Full name
              </label>
              <input
                className="input"
                value={form.fullName}
                onChange={e => setForm(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="E.g. Arjun Mehta"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-3)] mb-1">
                  Email
                </label>
                <input
                  className="input"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-3)] mb-1">
                  Phone
                </label>
                <input
                  className="input"
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91-XXXXXXXXXX"
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-3)] mb-1">
                  Location
                </label>
                <input
                  className="input"
                  value={form.location}
                  onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Bangalore, India"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-3)] mb-1">
                  LinkedIn URL
                </label>
                <input
                  className="input"
                  value={form.linkedinUrl}
                  onChange={e => setForm(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                  placeholder="https://linkedin.com/in/…"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-3)] mb-1">
                Professional summary
              </label>
              <textarea
                className="input"
                rows={4}
                value={form.summary}
                onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="2–3 lines capturing your core value, stack and years of experience."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Experience + Education */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-[var(--color-text-1)]">
              Work experience
            </p>
            <button
              type="button"
              onClick={addExperience}
              className="btn-secondary text-xs"
              style={{ paddingInline: 10, paddingBlock: 6 }}
            >
              <Plus size={14} className="mr-1" />
              Add role
            </button>
          </div>
          {form.experience.length === 0 && (
            <p className="text-xs text-[var(--color-text-4)]">
              Add at least one role – this is where the AI will pull most of its bullets from.
            </p>
          )}
          <div className="space-y-4">
            {form.experience.map((exp, index) => (
              <div
                key={exp.id}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-[var(--color-text-3)]">
                    Role #{index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="text-[var(--color-text-4)] hover:text-[var(--color-error)]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="block text-xs text-[var(--color-text-3)] mb-1">
                      Company
                    </label>
                    <input
                      className="input"
                      value={exp.company}
                      onChange={e => updateExperience(index, { company: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-text-3)] mb-1">
                      Title
                    </label>
                    <input
                      className="input"
                      value={exp.title}
                      onChange={e => updateExperience(index, { title: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="block text-xs text-[var(--color-text-3)] mb-1">
                      Start (MMM YYYY)
                    </label>
                    <input
                      className="input"
                      value={exp.startDate}
                      onChange={e => updateExperience(index, { startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-text-3)] mb-1">
                      End (MMM YYYY / Present)
                    </label>
                    <input
                      className="input"
                      value={exp.endDate}
                      onChange={e => updateExperience(index, { endDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-text-3)] mb-1">
                      Location
                    </label>
                    <input
                      className="input"
                      value={exp.location}
                      onChange={e => updateExperience(index, { location: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-3)] mb-1">
                    Impact bullets (one per line)
                  </label>
                  <textarea
                    className="input"
                    rows={4}
                    value={exp.bullets.join('\n')}
                    onChange={e =>
                      updateExperience(index, {
                        bullets: e.target.value
                          .split('\n')
                          .map(b => b.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Increased checkout conversion by 12% by..., Reduced infra costs by 18% by…"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-[var(--color-text-1)]">
                Education
              </p>
              <button
                type="button"
                onClick={addEducation}
                className="btn-secondary text-xs"
                style={{ paddingInline: 10, paddingBlock: 6 }}
              >
                <Plus size={14} className="mr-1" />
                Add institute
              </button>
            </div>
            {form.education.length === 0 && (
              <p className="text-xs text-[var(--color-text-4)]">
                Add at least your primary degree – B.Tech, B.E, M.Tech, MSc, etc.
              </p>
            )}
            <div className="space-y-3">
              {form.education.map((ed, index) => (
                <div
                  key={ed.id}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-[var(--color-text-3)]">
                      Education #{index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-[var(--color-text-4)] hover:text-[var(--color-error)]"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <label className="block text-[10px] text-[var(--color-text-3)] mb-1">
                        Degree
                      </label>
                      <input
                        className="input"
                        value={ed.degree}
                        onChange={e => updateEducation(index, { degree: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[var(--color-text-3)] mb-1">
                        Institution
                      </label>
                      <input
                        className="input"
                        value={ed.institution}
                        onChange={e => updateEducation(index, { institution: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <label className="block text-[10px] text-[var(--color-text-3)] mb-1">
                        Year
                      </label>
                      <input
                        className="input"
                        value={ed.year}
                        onChange={e => updateEducation(index, { year: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[var(--color-text-3)] mb-1">
                        CGPA (optional)
                      </label>
                      <input
                        className="input"
                        value={ed.cgpa ?? ''}
                        onChange={e => updateEducation(index, { cgpa: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <p className="text-sm font-medium text-[var(--color-text-1)]">
              Skills
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--color-text-3)] mb-1">
                  Technical skills (comma-separated)
                </label>
                <input
                  className="input"
                  value={form.skills.technical.join(', ')}
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      skills: {
                        ...prev.skills,
                        technical: e.target.value
                          .split(',')
                          .map(s => s.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                  placeholder="React, Node.js, TypeScript, PostgreSQL, Kafka…"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--color-text-3)] mb-1">
                  Soft skills (comma-separated)
                </label>
                <input
                  className="input"
                  value={form.skills.soft.join(', ')}
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      skills: {
                        ...prev.skills,
                        soft: e.target.value
                          .split(',')
                          .map(s => s.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                  placeholder="Stakeholder communication, mentoring, product thinking…"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects & Certifications */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-[var(--color-text-1)]">
              Projects
            </p>
            <button
              type="button"
              onClick={addProject}
              className="btn-secondary text-xs"
              style={{ paddingInline: 10, paddingBlock: 6 }}
            >
              <Plus size={14} className="mr-1" />
              Add project
            </button>
          </div>
          {form.projects.length === 0 && (
            <p className="text-xs text-[var(--color-text-4)]">
              Add 1–3 projects that show deep work and measurable impact. Side projects absolutely
              count.
            </p>
          )}
          <div className="space-y-4">
            {form.projects.map((project, index) => (
              <div
                key={project.id}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-[var(--color-text-3)]">
                    Project #{index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeProject(index)}
                    className="text-[var(--color-text-4)] hover:text-[var(--color-error)]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="block text-xs text-[var(--color-text-3)] mb-1">
                      Name
                    </label>
                    <input
                      className="input"
                      value={project.name}
                      onChange={e => updateProject(index, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-text-3)] mb-1">
                      Link (optional)
                    </label>
                    <input
                      className="input"
                      value={project.link ?? ''}
                      onChange={e => updateProject(index, { link: e.target.value })}
                      placeholder="GitHub or live URL"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-3)] mb-1">
                    Short description
                  </label>
                  <textarea
                    className="input"
                    rows={2}
                    value={project.description}
                    onChange={e => updateProject(index, { description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-3)] mb-1">
                    Tech stack (comma-separated)
                  </label>
                  <input
                    className="input"
                    value={project.techStack.join(', ')}
                    onChange={e =>
                      updateProject(index, {
                        techStack: e.target.value
                          .split(',')
                          .map(s => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Next.js, Node.js, PostgreSQL…"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-3)] mb-1">
                    Impact bullets (one per line)
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    value={project.bullets.join('\n')}
                    onChange={e =>
                      updateProject(index, {
                        bullets: e.target.value
                          .split('\n')
                          .map(b => b.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <p className="text-sm font-medium text-[var(--color-text-1)]">
            Certifications
          </p>
          <p className="text-xs text-[var(--color-text-3)]">
            Optional – list only certifications that strengthen your target roles.
          </p>
          <textarea
            className="input"
            rows={6}
            value={form.certifications.join('\n')}
            onChange={e =>
              setForm(prev => ({
                ...prev,
                certifications: e.target.value
                  .split('\n')
                  .map(c => c.trim())
                  .filter(Boolean),
              }))
            }
            placeholder={
              'AWS Certified Solutions Architect – Associate\nCertified Kubernetes Administrator (CKA)'
            }
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
          style={{ paddingInline: 20, paddingBlock: 10 }}
        >
          <Save size={16} />
          {saving ? 'Saving…' : 'Save master profile'}
        </button>
      </div>
    </section>
  )
}

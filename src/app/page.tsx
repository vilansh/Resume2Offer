'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Gauge,
  ShieldCheck,
  Users,
  TrendingUp,
  Zap,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.12 * i,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
}

export default function HomePage() {
  return (
    <div className="hero-bg min-h-screen text-[var(--color-text-1)]">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO */}
      <main className="pt-28 md:pt-32">
        <section className="container section pb-16 md:pb-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
            {/* Left */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-2)] bg-[rgba(12,11,18,0.85)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-3)] backdrop-blur-xl">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-gold-subtle)] text-[var(--color-gold)]">
                  <Sparkles size={14} />
                </span>
                AI-tailored resumes for India&apos;s tech roles
                <span className="h-1 w-1 rounded-full bg-[var(--color-border-2)]" />
                <span className="text-[var(--color-emerald)]">ATS safe · Recruiter-ready</span>
              </div>

              <div className="space-y-5">
                <h1 className="text-display">
                  Turn your resume into{' '}
                  <span className="italic gold-text">offers</span>
                  .
                </h1>
                <p className="max-w-xl text-base md:text-lg text-[var(--color-text-2)]">
                  Paste the JD, click generate, and get a ruthlessly tailored,
                  ATS-optimised resume in under 60 seconds. Built for Indian
                  product &amp; tech roles.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/signup" className="btn-primary">
                  Start free
                  <ArrowRight size={16} />
                </Link>
                <Link href="/login" className="btn-secondary">
                  View dashboard demo
                </Link>
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-3)]">
                  <ShieldCheck size={16} className="text-[var(--color-emerald)]" />
                  <span>No storage of PDFs. Only structured profile.</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 max-w-xl">
                <StatPill label="Resumes generated" value="47,293+" />
                <StatPill label="Avg. ATS uplift" value="3.2×" />
                <StatPill label="Time to first draft" value="12 sec" />
              </div>
            </motion.div>

            {/* Right mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mockup-wrapper"
            >
              <div
                className="mockup-card card-elevated"
                style={{
                  background:
                    'radial-gradient(circle at 10% 0, rgba(201,168,76,0.22), transparent 55%), var(--color-surface-2)',
                  borderRadius: 24,
                  padding: 22,
                }}
              >
                <HeroMockup />
              </div>
            </motion.div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="border-y border-[var(--color-border)] bg-[rgba(8,8,9,0.95)] py-4">
          <div className="container flex items-center gap-4">
            <span className="badge badge-gold text-[10px] uppercase tracking-[0.16em]">
              Trusted by candidates from
            </span>
            <div className="relative overflow-hidden flex-1">
              <div className="animate-marquee inline-flex min-w-max items-center gap-10 text-[var(--color-text-3)] text-xs md:text-sm">
                {[
                  'Flipkart',
                  'Swiggy',
                  'Razorpay',
                  'Freshworks',
                  'Paytm',
                  'CRED',
                  'PhonePe',
                  'Meesho',
                  'Zerodha',
                ].map(name => (
                  <span key={name} className="uppercase tracking-[0.18em] text-[10px] md:text-xs">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="container section-sm">
          <div className="grid gap-5 md:grid-cols-4">
            <StatCard label="Resumes tailored" value="47,293+" helper="Since Jan 2023" />
            <StatCard label="More interviews" value="3.2×" helper="Avg. across active users" />
            <StatCard label="ATS pass rate" value="89%" helper="Beats most job portals" />
            <StatCard label="Time to draft" value="12 sec" helper="From JD paste to PDF" />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="container section-sm">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="text-title">
              From JD to shortlist
              <br />
              in three ruthless steps.
            </h2>
            <p className="max-w-md text-sm md:text-base text-[var(--color-text-2)]">
              Backed by ATS-aware templates and India-specific prompts tuned for product, data,
              engineering and PM roles.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <HowStep
              icon={<Gauge size={18} />}
              title="1. Paste the JD"
              desc="Drop in any LinkedIn, Naukri or career-page description. We auto-detect seniority, domain and must-have skills."
            />
            <HowStep
              icon={<Sparkles size={18} />}
              title="2. Tailor using your master profile"
              desc="Resume2Offer maps your experience, projects and skills to the JD, ruthlessly cutting fluff to fit a single page."
            />
            <HowStep
              icon={<ShieldCheck size={18} />}
              title="3. Ship an ATS-proof PDF"
              desc="Get structured HTML and a print-safe PDF that survives ATS parsing and looks sharp in a hiring manager’s inbox."
            />
          </div>
        </section>

        {/* FEATURES BENTO */}
        <section id="features" className="container section-sm">
          <div className="mb-8">
            <h2 className="text-title mb-3">Built for Indian tech hiring, end-to-end.</h2>
            <p className="max-w-2xl text-sm md:text-base text-[var(--color-text-2)]">
              Every feature is tuned for the realities of Indian product companies: JD buzzwords,
              ATS quirks, and brutal recruiter screening.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-[2fr_1.4fr] lg:grid-rows-2">
            <div className="card-gold p-6 md:p-7 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-dm text-base font-semibold text-[var(--color-text-1)]">
                  JD-aware tailoring engine
                </h3>
                <span className="badge badge-emerald text-[10px] uppercase tracking-[0.18em]">
                  LLM + Rules
                </span>
              </div>
              <p className="mt-4 text-sm text-[var(--color-text-3)]">
                Our multi-provider AI stack (Groq → OpenRouter → Gemini) is prompt-engineered to
                understand Indian tech JDs – from Bangalore unicorns to early-stage SaaS.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-[var(--color-text-2)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[var(--color-emerald)]" />
                  Automatically emphasises must-have skills and quantifies impact.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[var(--color-emerald)]" />
                  Cuts buzzwords and filler that drag down ATS scores.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[var(--color-emerald)]" />
                  Produces clean, recruiter-readable bullets with Indian context.
                </li>
              </ul>
            </div>

            <div className="card p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-[var(--color-text-3)] uppercase tracking-[0.16em] mb-2">
                  ATS scoring
                </p>
                <h3 className="font-dm text-base font-semibold mb-3">
                  Transparent scoring, no black box.
                </h3>
                <p className="text-sm text-[var(--color-text-3)]">
                  See exactly which must-have and good-to-have skills you match, and what&apos;s
                  missing before you hit apply.
                </p>
              </div>
              <div className="mt-5 flex items-end justify-between gap-6">
                <div className="score-ring">
                  <svg width="90" height="90">
                    <circle
                      cx="45"
                      cy="45"
                      r="38"
                      stroke="rgba(55,49,80,0.8)"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="45"
                      cy="45"
                      r="38"
                      stroke="url(#scoreGradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2.4 * 38} ${2 * Math.PI * 38}`}
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#E8A838" />
                        <stop offset="50%" stopColor="#C9A84C" />
                        <stop offset="100%" stopColor="#2DD4A0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="score-value">87</div>
                </div>
                <div className="flex-1 space-y-2 text-xs text-[var(--color-text-3)]">
                  <ProgressRow label="Must-have skills" value={92} tone="gold" />
                  <ProgressRow label="Good-to-have" value={78} tone="emerald" />
                  <ProgressRow label="Context fit" value={84} tone="violet" />
                </div>
              </div>
            </div>

            <div className="card p-6 flex flex-col justify-between md:col-span-1 lg:row-span-2">
              <h3 className="font-dm text-base font-semibold mb-2">
                One master profile, infinite tailored resumes.
              </h3>
              <p className="text-sm text-[var(--color-text-3)]">
                Upload your base resume once. Maintain a living master profile of roles, projects,
                skills and certifications – then let Resume2Offer remix it per JD.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-[var(--color-text-2)]">
                <li className="flex items-center gap-2">
                  <Zap size={14} className="text-[var(--color-violet)]" />
                  Drag-and-drop resume parsing tuned for Indian formats.
                </li>
                <li className="flex items-center gap-2">
                  <Users size={14} className="text-[var(--color-violet)]" />
                  Separate technical vs. soft skills with proper tagging.
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-[var(--color-violet)]" />
                  Keep a history of every tailored resume and ATS score.
                </li>
              </ul>
              <Link
                href="/profile"
                className="btn-link mt-6 text-[var(--color-violet)]"
              >
                See profile editor
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* BEFORE / AFTER */}
        <section className="container section-sm">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="text-title">From &quot;generic&quot; to shortlist-ready.</h2>
            <p className="max-w-md text-sm md:text-base text-[var(--color-text-2)]">
              See how a vague resume for a Bangalore SDE role turns into a focused, 1-page profile
              that recruiters actually reply to.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <BeforeAfterCard
              label="Before · 34/100 ATS"
              score={34}
              tone="error"
              bullets={[
                'Mixed technologies, no clear stack focus.',
                'Unquantified bullets like “worked on APIs and dashboards”.',
                'Skills section full of buzzwords and tools never used in depth.',
              ]}
            />
            <BeforeAfterCard
              label="After · 91/100 ATS"
              score={91}
              tone="success"
              bullets={[
                'Prioritises backend-focused projects with the exact stack from the JD.',
                'Every bullet has an action, task and quantified result.',
                'Skills grouped by proficiency with must-have stack up front.',
              ]}
            />
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="container section-sm">
          <div className="mb-8 text-center">
            <h2 className="text-title mb-3">Built with Indian candidates in mind.</h2>
            <p className="mx-auto max-w-2xl text-sm md:text-base text-[var(--color-text-2)]">
              From tier-3 colleges to FAANG return offers, Resume2Offer helps you break through
              ATS filters and stand out in crowded pipelines.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Testimonial
              name="Aarushi Gupta"
              role="SDE II · Fintech · Bangalore"
              quote="I reused the same generic resume for years. With Resume2Offer I shipped two tailored versions in one evening and landed three interviews in a week."
            />
            <Testimonial
              name="Rahul Iyer"
              role="Senior Product Manager · SaaS · Pune"
              quote="The ATS score plus missing keywords view is gold. I now know exactly what to tweak before every application instead of guessing."
            />
            <Testimonial
              name="Mohammed Arshad"
              role="Data Engineer · Unicorn · Hyderabad"
              quote="Most tools feel very US-focused. This one actually understands Indian JDs, from notice periods to &quot;immediate joiner preferred&quot; language."
            />
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="container section-sm">
          <div className="mb-8 text-center">
            <h2 className="text-title mb-3">Simple pricing, honest value.</h2>
            <p className="mx-auto max-w-xl text-sm md:text-base text-[var(--color-text-2)]">
              Start free. Upgrade when you&apos;re actively applying or preparing for a switch.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-dm text-base font-semibold mb-1">Free</h3>
                <p className="text-sm text-[var(--color-text-3)] mb-4">
                  Perfect when you&apos;re exploring roles or updating your base resume.
                </p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-serif">₹0</span>
                  <span className="text-xs text-[var(--color-text-3)]">forever</span>
                </div>
                <ul className="space-y-2 text-xs text-[var(--color-text-2)]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[var(--color-emerald)]" />
                    3 tailored resumes / month
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[var(--color-emerald)]" />
                    Master profile with projects &amp; skills
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[var(--color-emerald)]" />
                    Basic ATS score &amp; keyword view
                  </li>
                </ul>
              </div>
              <Link href="/signup" className="btn-secondary mt-6 justify-center">
                Start with Free
              </Link>
            </div>

            <div
              className="card-gold p-6 flex flex-col justify-between"
              style={{
                boxShadow: '0 0 0 1px rgba(201,168,76,0.45), 0 24px 80px rgba(0,0,0,0.85)',
              }}
            >
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-dm text-base font-semibold">Pro</h3>
                  <span className="badge badge-gold text-[10px] uppercase tracking-[0.18em]">
                    Most popular
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-3)] mb-4">
                  For serious job hunts, role switches and referral-heavy pipelines.
                </p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-serif">₹299</span>
                  <span className="text-xs text-[var(--color-text-3)]">/ month</span>
                </div>
                <ul className="space-y-2 text-xs text-[var(--color-text-2)]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[var(--color-emerald)]" />
                    Unlimited tailored resumes &amp; JD saves
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[var(--color-emerald)]" />
                    Advanced ATS breakdown with section-wise tips
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[var(--color-emerald)]" />
                    Priority model routing (Groq → OpenRouter → Gemini)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[var(--color-emerald)]" />
                    Export-ready HTML for any job portal
                  </li>
                </ul>
              </div>
              <Link href="/signup" className="btn-primary mt-6 justify-center">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="container section-sm pb-20 md:pb-28">
          <div className="card-gold relative overflow-hidden px-6 py-10 md:px-10 md:py-12 text-center">
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.3,
                background:
                  'radial-gradient(circle at 0 0, rgba(201,168,76,0.4), transparent 55%), radial-gradient(circle at 100% 100%, rgba(124,111,205,0.4), transparent 55%)',
              }}
            />
            <div className="relative space-y-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-3)]">
                Ready when you are
              </p>
              <h2 className="text-title gold-text-static">
                Turn &ldquo;I&apos;ll update my resume this weekend&rdquo; into offers.
              </h2>
              <p className="mx-auto max-w-xl text-sm md:text-base text-[var(--color-text-2)]">
                Upload once, keep your profile fresh, and ship JD-specific resumes in minutes instead
                of weekends.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link href="/signup" className="btn-primary">
                  Start free in 30 seconds
                  <ArrowRight size={16} />
                </Link>
                <Link href="/login" className="btn-secondary">
                  Already have an account?
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[var(--color-border)] py-6 text-center text-xs text-[var(--color-text-3)]">
        <p>
          Built with <span className="gold-text-static">❤️</span> by{' '}
          <span className="gold-text-static">Vilansh Sharma</span>
        </p>
      </footer>
    </div>
  )
}

function Navbar() {
  return (
    <header className="navbar">
      <div className="container flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif gold-text-static text-xl md:text-2xl">
            Resume2Offer
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-xs md:flex">
          <Link href="#how-it-works" className="text-[var(--color-text-2)] hover:text-[var(--color-text-1)]">
            How it works
          </Link>
          <Link href="#features" className="text-[var(--color-text-2)] hover:text-[var(--color-text-1)]">
            Features
          </Link>
          <Link href="#pricing" className="text-[var(--color-text-2)] hover:text-[var(--color-text-1)]">
            Pricing
          </Link>
          <Link href="/login" className="text-[var(--color-text-2)] hover:text-[var(--color-text-1)]">
            Sign in
          </Link>
          <Link href="/signup" className="btn-primary">
            Start Free
          </Link>
        </nav>
        <Link
          href="/signup"
          className="btn-primary flex md:hidden"
          style={{ paddingInline: 14, paddingBlock: 8, fontSize: 12 }}
        >
          Start
        </Link>
      </div>
    </header>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <div className="stat-number">{value}</div>
      <p className="stat-label">{label}</p>
    </div>
  )
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="stat-card">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-3)] mb-2">
        {label}
      </p>
      <div className="stat-number mb-1">{value}</div>
      <p className="text-xs text-[var(--color-text-3)]">{helper}</p>
    </div>
  )
}

function HowStep({
  icon,
  title,
  desc,
}: {
  icon: ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="card p-5 md:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-3)] text-[var(--color-gold)]">
          {icon}
        </div>
        <h3 className="font-dm text-sm font-semibold text-[var(--color-text-1)]">
          {title}
        </h3>
      </div>
      <p className="text-xs md:text-sm text-[var(--color-text-3)]">{desc}</p>
    </div>
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
      <div className="mb-1 flex items-center justify-between text-[10px]">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="progress-track">
        <div className={fillClass} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function BeforeAfterCard({
  label,
  score,
  tone,
  bullets,
}: {
  label: string
  score: number
  tone: 'success' | 'error'
  bullets: string[]
}) {
  const color =
    tone === 'success'
      ? 'var(--color-success)'
      : 'var(--color-error)'

  return (
    <div className="card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-[var(--color-text-3)] uppercase tracking-[0.16em]">
          {label}
        </p>
        <span
          className="badge"
          style={{
            borderColor: color,
            color,
            background: 'rgba(0,0,0,0.14)',
          }}
        >
          ATS {score}/100
        </span>
      </div>
      <ul className="space-y-2 text-xs text-[var(--color-text-2)]">
        {bullets.map(point => (
          <li key={point} className="flex items-start gap-2">
            <span
              style={{
                marginTop: 4,
                width: 4,
                height: 4,
                borderRadius: 999,
                background: 'var(--color-border-2)',
              }}
            />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Testimonial({
  name,
  role,
  quote,
}: {
  name: string
  role: string
  quote: string
}) {
  return (
    <div className="card p-6 flex flex-col gap-3">
      <p className="text-sm text-[var(--color-text-2)]">&ldquo;{quote}&rdquo;</p>
      <div className="mt-2">
        <p className="text-sm font-medium text-[var(--color-text-1)]">
          {name}
        </p>
        <p className="text-xs text-[var(--color-text-3)]">{role}</p>
      </div>
    </div>
  )
}

function HeroMockup() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-3)] mb-1">
            Senior Backend Engineer · Bangalore
          </p>
          <p className="text-sm text-[var(--color-text-2)]">
            Tailored from your master profile for Razorpay-style fintech roles.
          </p>
        </div>
        <div className="score-ring">
          <svg width="80" height="80">
            <circle
              cx="40"
              cy="40"
              r="33"
              stroke="rgba(55,49,80,0.8)"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="40"
              cy="40"
              r="33"
              stroke="url(#heroScoreGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2.4 * 33} ${2 * Math.PI * 33}`}
            />
            <defs>
              <linearGradient id="heroScoreGradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#2DD4A0" />
                <stop offset="100%" stopColor="#C9A84C" />
              </linearGradient>
            </defs>
          </svg>
          <div className="score-value">87</div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3 text-xs">
        <div>
          <p className="mb-1 text-[var(--color-text-3)]">Must-have skills</p>
          <div className="progress-track">
            <div className="progress-fill-gold" style={{ width: '92%' }} />
          </div>
        </div>
        <div>
          <p className="mb-1 text-[var(--color-text-3)]">Good-to-have</p>
          <div className="progress-track">
            <div className="progress-fill-emerald" style={{ width: '78%' }} />
          </div>
        </div>
        <div>
          <p className="mb-1 text-[var(--color-text-3)]">Context fit</p>
          <div className="progress-track">
            <div
              className="progress-fill-emerald"
              style={{ width: '84%', background: 'var(--color-violet)' }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 text-[11px]">
        <div>
          <p className="mb-1 text-[var(--color-text-3)]">Matched keywords</p>
          <div className="flex flex-wrap gap-1.5">
            {['Node.js', 'Kafka', 'PostgreSQL', 'Distributed systems', 'Observability'].map(
              k => (
                <span
                  key={k}
                  className="badge"
                  style={{
                    borderColor: 'var(--color-emerald-muted)',
                    background: 'var(--color-emerald-subtle)',
                    color: 'var(--color-emerald)',
                  }}
                >
                  {k}
                </span>
              )
            )}
          </div>
        </div>
        <div>
          <p className="mb-1 text-[var(--color-text-3)]">Missing keywords</p>
          <div className="flex flex-wrap gap-1.5">
            {['PCI-DSS', 'Design reviews'].map(k => (
              <span
                key={k}
                className="badge"
                style={{
                  borderColor: 'var(--color-error)',
                  background: 'rgba(224,82,82,0.12)',
                  color: 'var(--color-error)',
                }}
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

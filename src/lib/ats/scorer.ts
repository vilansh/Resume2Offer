import { TailoredResume, ATSResult } from '@/types/resume'
import { JDAnalysis } from '@/types/jd'

function extractAllText(resume: TailoredResume): string {
  const parts = [
    resume.summary,
    ...resume.experience.flatMap(e => [e.title, e.company, ...e.bullets]),
    ...resume.skills.primary,
    ...resume.skills.secondary,
    ...resume.projects.flatMap(p => [...p.techStack, ...p.bullets]),
    ...resume.certifications,
  ]
  return parts.join(' ').toLowerCase()
}

function matchScore(text: string, keywords: string[]): {
  score: number
  matched: string[]
  missing: string[]
} {
  if (!keywords.length) return { score: 0, matched: [], missing: [] }

  const matched: string[] = []
  const missing: string[] = []

  keywords.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      matched.push(keyword)
    } else {
      missing.push(keyword)
    }
  })

  return {
    score: (matched.length / keywords.length) * 100,
    matched,
    missing,
  }
}

export function calculateATSScore(
  resume: TailoredResume,
  jdAnalysis: JDAnalysis
): ATSResult {
  const text = extractAllText(resume)

  const mustHave = matchScore(text, jdAnalysis.mustHaveSkills)
  const goodToHave = matchScore(text, jdAnalysis.goodToHaveSkills)
  const context = matchScore(text, jdAnalysis.keywords)

  const finalScore = Math.round(
    0.6 * mustHave.score +
    0.3 * goodToHave.score +
    0.1 * context.score
  )

  const allMatched = [...new Set([...mustHave.matched, ...goodToHave.matched])]
  const allMissing = [...new Set([...mustHave.missing, ...goodToHave.missing])]

  return {
    finalScore,
    breakdown: {
      mustHaveScore: Math.round(mustHave.score),
      goodToHaveScore: Math.round(goodToHave.score),
      contextScore: Math.round(context.score),
    },
    matched: allMatched,
    missing: allMissing,
  }
}
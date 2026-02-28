import { JDAnalysis } from './jd'

export interface TailoredExperience {
  company: string
  title: string
  duration: string
  bullets: string[]
}

export interface TailoredSkills {
  primary: string[]
  secondary: string[]
}

export interface TailoredProject {
  name: string
  techStack: string[]
  bullets: string[]
}

export interface TailoredResume {
  personalInfo: {
    name: string
    email: string
    phone: string
    location: string
    linkedin?: string
  }
  summary: string
  experience: TailoredExperience[]
  skills: TailoredSkills
  education: Array<{
    degree: string
    institution: string
    year: string
    cgpa?: string
  }>
  projects: TailoredProject[]
  certifications: string[]
}

export interface ATSBreakdown {
  mustHaveScore: number
  goodToHaveScore: number
  contextScore: number
}

export interface ATSResult {
  finalScore: number
  breakdown: ATSBreakdown
  matched: string[]
  missing: string[]
}

export interface Resume {
  id: string
  userId: string
  jobTitle: string
  companyName: string
  jdRaw: string
  jdAnalysis: JDAnalysis
  tailoredJson: TailoredResume
  atsScore: number
  atsBreakdown: ATSBreakdown
  htmlOutput: string
  status: 'draft' | 'final'
  createdAt: string
}
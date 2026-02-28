export interface JDAnalysis {
    jobTitle: string
    company: string
    seniorityLevel: 'entry' | 'mid' | 'senior'
    mustHaveSkills: string[]
    goodToHaveSkills: string[]
    keywords: string[]
    responsibilities: string[]
    experienceRequired: string
    domain: string
  }
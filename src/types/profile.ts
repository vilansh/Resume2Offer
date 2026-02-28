export interface WorkExperience {
    id: string
    company: string
    title: string
    startDate: string
    endDate: string
    location: string
    current: boolean
    bullets: string[]
  }
  
  export interface Education {
    id: string
    degree: string
    institution: string
    year: string
    cgpa?: string
  }
  
  export interface Project {
    id: string
    name: string
    description: string
    techStack: string[]
    bullets: string[]
    link?: string
  }
  
  export interface Skills {
    technical: string[]
    soft: string[]
  }
  
  export interface MasterProfile {
    id: string
    fullName: string
    email: string
    phone: string
    location: string
    linkedinUrl?: string
    portfolioUrl?: string
    summary: string
    experience: WorkExperience[]
    education: Education[]
    skills: Skills
    projects: Project[]
    certifications: string[]
    rawResumeText?: string
    createdAt: string
    updatedAt: string
  }
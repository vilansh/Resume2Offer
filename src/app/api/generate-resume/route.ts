import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callAI } from '@/lib/ai/client'
import type { JDAnalysis } from '@/types/jd'
import type { TailoredResume, ATSBreakdown } from '@/types/resume'
import type { MasterProfile } from '@/types/profile'
import { calculateATSScore } from '@/lib/ats/scorer'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { userId, jdAnalysis } = (await req.json()) as {
      userId?: string
      jdAnalysis?: JDAnalysis
    }

    if (!jdAnalysis) {
      return NextResponse.json(
        { error: 'jdAnalysis payload is required.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    const effectiveUserId = user?.id ?? userId

    if (!effectiveUserId || userError) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const { data: profileRow, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', effectiveUserId)
      .single()

    if (profileError || !profileRow) {
      console.error('Profile fetch error', profileError)
      return NextResponse.json(
        { error: 'Master profile not found. Please complete your profile first.' },
        { status: 400 }
      )
    }

    const masterProfile: MasterProfile = {
      id: profileRow.id as string,
      fullName: (profileRow.full_name as string) || '',
      email: (profileRow.email as string) || user?.email || '',
      phone: (profileRow.phone as string) || '',
      location: (profileRow.location as string) || '',
      linkedinUrl: (profileRow.linkedin_url as string) || '',
      portfolioUrl: '',
      summary: (profileRow.summary as string) || '',
      experience: (profileRow.experience as any) || [],
      education: (profileRow.education as any) || [],
      skills: (profileRow.skills as any) || { technical: [], soft: [] },
      projects: (profileRow.projects as any) || [],
      certifications: (profileRow.certifications as any) || [],
      rawResumeText: (profileRow.raw_resume_text as string) || '',
      createdAt: (profileRow.created_at as string) || '',
      updatedAt: (profileRow.updated_at as string) || '',
    }

    const systemPrompt =
      "You are an elite ATS resume writer for India's tech market."

    const userPrompt = [
      'Given master profile and JD analysis, generate tailored resume.',
      'RULES:',
      '1. Fits exactly 1 page - cut ruthlessly',
      '2. ZERO buzzwords (no passionate/dynamic/synergy)',
      '3. Every bullet: Action Verb + Task + Quantified Result',
      '4. mustHaveSkills prominent in skills section',
      '5. Summary: 2 sentences, mention role title from JD',
      '6. Quantify everything: %, users, time saved, revenue',
      'Output: { personalInfo, summary, experience, skills,',
      'education, projects, certifications }',
      'Return ONLY valid JSON.',
      '',
      'Master profile JSON:',
      JSON.stringify(masterProfile),
      '',
      'JD analysis JSON:',
      JSON.stringify(jdAnalysis),
    ].join('\n')

    const aiResponse = await callAI(systemPrompt, userPrompt, 'groq')

    let tailored: TailoredResume
    try {
      tailored = JSON.parse(aiResponse) as TailoredResume
    } catch (err) {
      console.error('Tailored resume JSON error', err, aiResponse)
      return NextResponse.json(
        { error: 'AI returned invalid tailored resume JSON.' },
        { status: 500 }
      )
    }

    const atsResult = calculateATSScore(tailored, jdAnalysis)

    const atsBreakdown: ATSBreakdown = atsResult.breakdown

    const { data: inserted, error: insertError } = await supabase
      .from('resumes')
      .insert({
        user_id: effectiveUserId,
        job_title: jdAnalysis.jobTitle,
        company_name: jdAnalysis.company,
        jd_raw: '',
        jd_analysis: jdAnalysis,
        tailored_json: tailored,
        ats_score: atsResult.finalScore,
        ats_breakdown: atsBreakdown,
        html_output: '',
        status: 'final',
      })
      .select('id')
      .single()

    if (insertError || !inserted) {
      console.error('Insert resume error', insertError)
      return NextResponse.json(
        { error: 'Could not save generated resume.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      resumeId: inserted.id as string,
      tailoredJson: tailored,
      atsScore: atsResult.finalScore,
      atsBreakdown,
      matched: atsResult.matched,
      missing: atsResult.missing,
    })
  } catch (err) {
    console.error('Unexpected generate-resume error', err)
    return NextResponse.json(
      { error: 'Unexpected error while generating resume.' },
      { status: 500 }
    )
  }
}


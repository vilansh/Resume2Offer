import { NextRequest, NextResponse } from 'next/server'
import { callAI } from '@/lib/ai/client'
import type { JDAnalysis } from '@/types/jd'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { jdText, jobTitle, company } = (await req.json()) as {
      jdText?: string
      jobTitle?: string
      company?: string
    }

    if (!jdText || !jobTitle) {
      return NextResponse.json(
        { error: 'jdText and jobTitle are required.' },
        { status: 400 }
      )
    }

    const systemPrompt =
      'You are an expert job description analyst for Indian tech and product roles.'

    const userPrompt = [
      'Analyze this JD and extract:',
      '{ jobTitle, company, seniorityLevel, mustHaveSkills[],',
      'goodToHaveSkills[], keywords[], responsibilities[],',
      'experienceRequired, domain }',
      'mustHaveSkills: max 10, hard requirements only',
      'goodToHaveSkills: max 8',
      'keywords: max 20 ATS terms',
      'Return ONLY valid JSON.',
      '',
      'Input meta:',
      `jobTitle: ${jobTitle}`,
      `company: ${company || 'Unknown'}`,
      '',
      'Job description:',
      jdText,
    ].join('\n')

    const aiResponse = await callAI(systemPrompt, userPrompt, 'groq')

    let analysis: JDAnalysis
    try {
      analysis = JSON.parse(aiResponse) as JDAnalysis
    } catch (err) {
      console.error('JD analysis JSON error', err, aiResponse)
      return NextResponse.json(
        { error: 'AI returned invalid JD analysis JSON.' },
        { status: 500 }
      )
    }

    // Ensure defaults
    analysis.jobTitle = analysis.jobTitle || jobTitle
    analysis.company = analysis.company || company || ''

    return NextResponse.json(analysis satisfies JDAnalysis)
  } catch (err) {
    console.error('Unexpected analyze-jd error', err)
    return NextResponse.json(
      { error: 'Unexpected error while analyzing JD.' },
      { status: 500 }
    )
  }
}


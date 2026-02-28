import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import { createClient } from '@/lib/supabase/server'
import { callAI } from '@/lib/ai/client'
import type { MasterProfile } from '@/types/profile'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'PDF file is required under the "file" field.' },
        { status: 400 }
      )
    }

    const bytes = await (file as File).arrayBuffer()
    const buffer = Buffer.from(bytes)

    const parsed = await pdfParse(buffer)
    const text = parsed.text || ''

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text from the uploaded PDF.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const systemPrompt = 'You are a resume parser for the Indian job market.'

    const userPrompt = [
      'Convert this resume text to JSON:',
      '{ fullName, email, phone, location, linkedinUrl, summary,',
      'experience: [{company, title, startDate, endDate,',
      'location, current, bullets[]}],',
      'education: [{degree, institution, year, cgpa}],',
      'skills: {technical[], soft[]},',
      'projects: [{name, description, techStack[], bullets[]}],',
      'certifications[] }',
      'Rules: Extract only present data. Normalize dates MMM YYYY.',
      'Return ONLY valid JSON.',
      '',
      'Resume text:',
      text,
    ].join('\n')

    const aiResponse = await callAI(systemPrompt, userPrompt, 'groq')

    let parsedJson: any
    try {
      parsedJson = JSON.parse(aiResponse)
    } catch (err) {
      console.error('Parser JSON error', err, aiResponse)
      return NextResponse.json(
        { error: 'AI parser returned invalid JSON. Please try again.' },
        { status: 500 }
      )
    }

    const profile: MasterProfile = {
      id: user.id,
      fullName: parsedJson.fullName ?? '',
      email: parsedJson.email ?? user.email ?? '',
      phone: parsedJson.phone ?? '',
      location: parsedJson.location ?? '',
      linkedinUrl: parsedJson.linkedinUrl ?? '',
      portfolioUrl: '',
      summary: parsedJson.summary ?? '',
      experience: parsedJson.experience ?? [],
      education: parsedJson.education ?? [],
      skills: parsedJson.skills ?? { technical: [], soft: [] },
      projects: parsedJson.projects ?? [],
      certifications: parsedJson.certifications ?? [],
      rawResumeText: text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const { error: upsertError } = await supabase
      .from('profiles')
      .update({
        full_name: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        linkedin_url: profile.linkedinUrl,
        summary: profile.summary,
        experience: profile.experience,
        education: profile.education,
        skills: profile.skills,
        projects: profile.projects,
        certifications: profile.certifications,
        raw_resume_text: profile.rawResumeText,
      })
      .eq('id', user.id)

    if (upsertError) {
      console.error('Error updating profile from parser', upsertError)
    }

    return NextResponse.json({ profile })
  } catch (err) {
    console.error('Unexpected parse-resume error', err)
    return NextResponse.json(
      { error: 'Unexpected error while parsing resume.' },
      { status: 500 }
    )
  }
}


import { NextResponse } from 'next/server'

export async function POST() {
  // Client-side export using html2pdf.js – this route simply returns 200.
  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ ok: true })
}


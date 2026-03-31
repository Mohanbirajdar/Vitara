import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEMO_USER_ID = 'cmndze6o5000053elv1ept3gs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symptomName = searchParams.get('symptomName')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = { userId: DEMO_USER_ID }
    if (symptomName) where.symptomName = { contains: symptomName, mode: 'insensitive' }

    const symptoms = await prisma.symptomLog.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
    })
    return NextResponse.json({ data: symptoms, total: symptoms.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch symptoms' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.symptomName || typeof body.severity !== 'number') {
      return NextResponse.json({ error: 'symptomName and severity required' }, { status: 400 })
    }
    const log = await prisma.symptomLog.create({
      data: {
        userId: DEMO_USER_ID,
        symptomName: body.symptomName,
        severity: body.severity,
        notes: body.notes || null,
        date: body.date ? new Date(body.date) : new Date(),
      },
    })
    return NextResponse.json({ data: log, message: 'Symptom logged' }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to log symptom' }, { status: 500 })
  }
}

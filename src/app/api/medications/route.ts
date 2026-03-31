import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEMO_USER_ID = 'cmndze6o5000053elv1ept3gs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = { userId: DEMO_USER_ID }
    if (isActive !== null) where.isActive = isActive === 'true'

    const medications = await prisma.medication.findMany({
      where,
      orderBy: { startDate: 'desc' },
    })
    return NextResponse.json({ data: medications, total: medications.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const medication = await prisma.medication.create({
      data: {
        userId: DEMO_USER_ID,
        name: body.name,
        dosage: body.dosage,
        frequency: body.frequency,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        prescribedBy: body.prescribedBy || null,
        notes: body.notes || null,
      },
    })
    return NextResponse.json({ data: medication, message: 'Medication added' }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to add medication' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    const medication = await prisma.medication.update({ where: { id }, data: updates })
    return NextResponse.json({ data: medication })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update medication' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateDbUser } from '@/lib/auth'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

async function getUserId() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null
  await getOrCreateDbUser(session.user.id, session.user.email!, session.user.user_metadata?.name)
  return session.user.id
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = { userId }
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
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const medication = await prisma.medication.create({
      data: {
        userId,
        name: body.name,
        dosage: body.dosage,
        frequency: body.frequency,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        prescribedBy: body.prescribedBy || null,
        isActive: body.isActive ?? true,
        notes: body.notes || null,
      },
    })
    return NextResponse.json({ data: medication }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create medication' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { id, ...updates } = body
    const medication = await prisma.medication.update({ where: { id }, data: updates })
    return NextResponse.json({ data: medication })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update medication' }, { status: 500 })
  }
}

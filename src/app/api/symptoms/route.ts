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
    const limit = parseInt(searchParams.get('limit') || '50')

    const symptoms = await prisma.symptomLog.findMany({
      where: { userId },
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
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const symptom = await prisma.symptomLog.create({
      data: {
        userId,
        symptomName: body.symptomName || body.symptom,
        severity: body.severity,
        notes: body.notes || null,
        date: body.loggedAt ? new Date(body.loggedAt) : (body.date ? new Date(body.date) : new Date()),
      },
    })
    return NextResponse.json({ data: symptom }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to log symptom' }, { status: 500 })
  }
}

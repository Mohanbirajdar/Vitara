import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getOrCreateDbUser } from '@/lib/auth'

async function getUserId() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null
  await getOrCreateDbUser(session.user.id, session.user.email!, session.user.user_metadata?.name)
  return session.user.id
}

export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({ data: user })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name,
        patientProfile: {
          update: {
            bloodType: body.bloodType,
            height: body.height ? parseFloat(body.height) : undefined,
            weight: body.weight ? parseFloat(body.weight) : undefined,
            dateOfBirth: body.dob ? new Date(body.dob) : undefined,
            isAnonymized: body.isAnonymized,
          },
        },
      },
      include: { patientProfile: true },
    })

    return NextResponse.json({ data: user })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

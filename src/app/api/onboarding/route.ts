import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getOrCreateDbUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = session.user.id
    await getOrCreateDbUser(userId, session.user.email!, session.user.user_metadata?.name)

    const body = await request.json()

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name || undefined,
        isOnboarded: true,
        patientProfile: {
          update: {
            dateOfBirth: body.dob ? new Date(body.dob) : undefined,
            bloodType: body.bloodType || undefined,
            height: body.height ? parseFloat(body.height) : undefined,
            weight: body.weight ? parseFloat(body.weight) : undefined,
            allergies: body.allergies || [],
            conditions: body.conditions || [],
            familyHistory: body.familyHistory || [],
            surgicalHistory: body.surgicalHistory || undefined,
            lifestyle: body.lifestyle || undefined,
            emergencyContact: body.emergencyContact || undefined,
            consentGiven: true,
            consentDate: new Date(),
          },
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to save onboarding data' }, { status: 500 })
  }
}

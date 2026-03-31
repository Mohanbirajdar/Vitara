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

export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const providers = await prisma.providerConnection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ data: providers, total: providers.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const provider = await prisma.providerConnection.create({
      data: {
        userId,
        providerName: body.providerName,
        providerType: body.providerType || 'OTHER',
        status: 'connected',
      },
    })
    return NextResponse.json({ data: provider }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { id, ...updates } = body
    const provider = await prisma.providerConnection.update({
      where: { id },
      data: { ...updates, lastSynced: updates.status === 'connected' ? new Date() : undefined },
    })
    return NextResponse.json({ data: provider })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await prisma.providerConnection.delete({ where: { id, userId } })
    return NextResponse.json({ message: 'Provider disconnected' })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to disconnect provider' }, { status: 500 })
  }
}

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

    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ data: notes, total: notes.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const note = await prisma.note.create({
      data: {
        userId,
        title: body.title,
        content: body.content,
        appointmentDate: body.appointmentDate ? new Date(body.appointmentDate) : null,
        tags: body.tags || [],
      },
    })
    return NextResponse.json({ data: note }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await prisma.note.delete({ where: { id, userId } })
    return NextResponse.json({ message: 'Note deleted' })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}

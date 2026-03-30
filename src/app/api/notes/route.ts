import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEMO_USER_ID = 'cmnd6w58s0000iiaqkbbvrtcs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')

    const where: Record<string, unknown> = { userId: DEMO_USER_ID }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (tag) where.tags = { has: tag }

    const notes = await prisma.note.findMany({ where, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ data: notes, total: notes.length })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.title || !body.content) {
      return NextResponse.json({ error: 'title and content required' }, { status: 400 })
    }
    const note = await prisma.note.create({
      data: {
        userId: DEMO_USER_ID,
        recordId: body.recordId || null,
        title: body.title,
        content: body.content,
        appointmentDate: body.appointmentDate ? new Date(body.appointmentDate) : null,
        tags: Array.isArray(body.tags) ? body.tags : [],
      },
    })
    return NextResponse.json({ data: note, message: 'Note saved' }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await prisma.note.delete({ where: { id } })
    return NextResponse.json({ message: 'Note deleted' })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Demo user ID – replace with auth session in production
const DEMO_USER_ID = 'cmnd6w58s0000iiaqkbbvrtcs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const isHidden = searchParams.get('isHidden')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    const where: Record<string, unknown> = { userId: DEMO_USER_ID }
    if (type) where.type = type
    where.isHidden = isHidden === 'true' ? true : false

    const [records, total] = await Promise.all([
      prisma.medicalRecord.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.medicalRecord.count({ where }),
    ])

    return NextResponse.json({ data: records, total, page, pageSize, hasMore: page * pageSize < total })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const record = await prisma.medicalRecord.create({
      data: {
        userId: DEMO_USER_ID,
        title: body.title,
        type: body.type,
        date: new Date(body.date),
        provider: body.provider || null,
        sourceType: body.sourceType || 'MANUAL',
        notes: body.notes || null,
        attachmentUrl: body.attachmentUrl || null,
      },
    })
    return NextResponse.json({ data: record, message: 'Record created' }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    const record = await prisma.medicalRecord.update({
      where: { id },
      data: { ...updates, isEdited: true, editedData: updates },
    })
    return NextResponse.json({ data: record })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await prisma.medicalRecord.update({ where: { id }, data: { isHidden: true } })
    return NextResponse.json({ message: 'Record hidden' })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to hide record' }, { status: 500 })
  }
}

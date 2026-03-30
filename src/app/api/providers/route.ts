import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEMO_USER_ID = 'cmnd6w58s0000iiaqkbbvrtcs'

export async function GET() {
  try {
    const providers = await prisma.providerConnection.findMany({
      where: { userId: DEMO_USER_ID },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({
      data: providers,
      total: providers.length,
      connected: providers.filter(p => p.status === 'connected').length,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body.providerName || !body.providerType) {
      return NextResponse.json({ error: 'providerName and providerType required' }, { status: 400 })
    }
    const provider = await prisma.providerConnection.create({
      data: {
        userId: DEMO_USER_ID,
        providerName: body.providerName,
        providerType: body.providerType,
        status: 'pending',
        endpoint: body.endpoint || null,
      },
    })
    return NextResponse.json({ data: provider, message: 'Provider connected' }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to connect provider' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action, ...updates } = body
    const data = action === 'sync'
      ? { status: 'connected', lastSynced: new Date() }
      : updates
    const provider = await prisma.providerConnection.update({ where: { id }, data })
    return NextResponse.json({ data: provider })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await prisma.providerConnection.delete({ where: { id } })
    return NextResponse.json({ message: 'Provider disconnected' })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to disconnect provider' }, { status: 500 })
  }
}

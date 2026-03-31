import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getOrCreateDbUser } from '@/lib/auth'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getOrCreateDbUser(
      session.user.id,
      session.user.email!,
      session.user.user_metadata?.name,
    )

    return NextResponse.json({ data: user })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to provision user' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ data: { id: session.user.id, email: session.user.email } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
  }
}

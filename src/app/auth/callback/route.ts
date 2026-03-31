import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getOrCreateDbUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session?.user) {
      await getOrCreateDbUser(
        session.user.id,
        session.user.email!,
        session.user.user_metadata?.name,
      )
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}

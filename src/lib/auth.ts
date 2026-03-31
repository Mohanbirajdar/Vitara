import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

/**
 * Returns the authenticated Supabase user ID from the session,
 * or null if the request is unauthenticated.
 */
export async function getSessionUserId(): Promise<string | null> {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

/**
 * Returns the user ID if authenticated, or throws a 401 response.
 * Use with: const userId = await requireAuth()
 */
export async function requireAuth(): Promise<string> {
  const userId = await getSessionUserId()
  if (!userId) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return userId
}

/**
 * Auto-provisions a Prisma User + PatientProfile the first time
 * a Supabase-authenticated user hits any API route.
 */
export async function getOrCreateDbUser(supabaseUserId: string, email: string, name?: string) {
  const existing = await prisma.user.findUnique({ where: { id: supabaseUserId } })
  if (existing) return existing

  return prisma.user.create({
    data: {
      id: supabaseUserId,
      email,
      name: name || email.split('@')[0],
      patientProfile: {
        create: { isAnonymized: false },
      },
    },
  })
}

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function getSessionUserId(): Promise<string | null> {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

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

export async function getOrCreateDbUser(supabaseUserId: string, email: string, name?: string) {
  const existing = await prisma.user.findUnique({ where: { id: supabaseUserId } })
  if (existing) return existing

  const displayName = name || email.split('@')[0]

  // Create user + profile
  const user = await prisma.user.create({
    data: {
      id: supabaseUserId,
      email,
      name: displayName,
      patientProfile: {
        create: {
          isAnonymized: false,
          bloodType: 'O+',
          height: 170,
          weight: 70,
        },
      },
    },
  })

  // Seed demo data so the dashboard isn't empty
  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000)

  await prisma.medicalRecord.createMany({
    data: [
      { userId: supabaseUserId, title: 'Annual Blood Panel', type: 'lab', date: daysAgo(45), provider: 'City Medical Center', sourceType: 'FHIR', notes: 'Routine annual bloodwork. All markers within normal range.' },
      { userId: supabaseUserId, title: 'Cardiology Follow-up', type: 'visit', date: daysAgo(30), provider: 'Dr. Patel – Heart Clinic', sourceType: 'MANUAL', notes: 'Blood pressure well controlled. Continue current medications.' },
      { userId: supabaseUserId, title: 'Chest X-Ray', type: 'imaging', date: daysAgo(20), provider: 'Radiology Associates', sourceType: 'MANUAL', notes: 'No acute cardiopulmonary findings.' },
      { userId: supabaseUserId, title: 'Lipid Panel', type: 'lab', date: daysAgo(10), provider: 'City Medical Center', sourceType: 'FHIR', notes: 'LDL slightly elevated at 132 mg/dL. Dietary changes recommended.' },
      { userId: supabaseUserId, title: 'Hypertension', type: 'condition', date: daysAgo(365), provider: 'Dr. Patel', sourceType: 'MANUAL', notes: 'Stage 1 hypertension, managed with medication and lifestyle changes.' },
    ],
  })

  await prisma.medication.createMany({
    data: [
      { userId: supabaseUserId, name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime', startDate: daysAgo(180), isActive: true, prescribedBy: 'Dr. Patel' },
      { userId: supabaseUserId, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily in the morning', startDate: daysAgo(365), isActive: true, prescribedBy: 'Dr. Patel' },
      { userId: supabaseUserId, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals', startDate: daysAgo(90), isActive: true, prescribedBy: 'Dr. Chen' },
      { userId: supabaseUserId, name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', startDate: daysAgo(60), endDate: daysAgo(50), isActive: false, prescribedBy: 'Dr. Park' },
    ],
  })

  await prisma.symptomLog.createMany({
    data: [
      { userId: supabaseUserId, symptomName: 'Headache', severity: 4, notes: 'Mild tension headache after work', date: daysAgo(2) },
      { userId: supabaseUserId, symptomName: 'Fatigue', severity: 5, notes: 'Feeling more tired than usual', date: daysAgo(5) },
      { userId: supabaseUserId, symptomName: 'Shortness of breath', severity: 3, notes: 'Mild, only during exercise', date: daysAgo(8) },
      { userId: supabaseUserId, symptomName: 'Chest tightness', severity: 6, notes: 'Lasted about 10 minutes, resolved on its own', date: daysAgo(12) },
      { userId: supabaseUserId, symptomName: 'Dizziness', severity: 3, notes: 'Brief episode when standing up quickly', date: daysAgo(15) },
      { userId: supabaseUserId, symptomName: 'Headache', severity: 3, notes: 'Morning headache, resolved after coffee', date: daysAgo(20) },
      { userId: supabaseUserId, symptomName: 'Fatigue', severity: 4, notes: 'Post-exercise fatigue', date: daysAgo(25) },
    ],
  })

  await prisma.note.createMany({
    data: [
      { userId: supabaseUserId, title: 'Questions for Dr. Patel', content: 'Ask about adjusting Lisinopril dosage. Discuss recent LDL results. Inquire about exercise restrictions.', tags: ['cardiology', 'medication'], appointmentDate: new Date(now.getTime() + 7 * 86400000) },
      { userId: supabaseUserId, title: 'Post-appointment notes', content: 'Dr. Patel says BP is well controlled. Recommended DASH diet. Schedule follow-up in 3 months.', tags: ['cardiology', 'follow-up'] },
      { userId: supabaseUserId, title: 'Medication side effects to track', content: 'Atorvastatin – watch for muscle pain. Lisinopril – monitor for dry cough. Log any new symptoms immediately.', tags: ['medication', 'side-effects'] },
    ],
  })

  await prisma.providerConnection.createMany({
    data: [
      { userId: supabaseUserId, providerName: 'City Medical Center', providerType: 'HOSPITAL', status: 'connected', lastSynced: daysAgo(1) },
      { userId: supabaseUserId, providerName: 'Dr. Patel – Heart Clinic', providerType: 'SPECIALIST', status: 'connected', lastSynced: daysAgo(3) },
      { userId: supabaseUserId, providerName: 'Radiology Associates', providerType: 'CLINIC', status: 'pending' },
    ],
  })

  return user
}

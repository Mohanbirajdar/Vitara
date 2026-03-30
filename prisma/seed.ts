import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'sarah.johnson@example.com' },
    update: {},
    create: {
      email: 'sarah.johnson@example.com',
      name: 'Sarah Johnson',
      avatar: null,
    },
  })
  console.log('✓ User:', user.email)

  // Patient profile
  await prisma.patientProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      dateOfBirth: new Date('1988-03-15'),
      bloodType: 'A+',
      height: 165,
      weight: 62,
      allergies: ['Penicillin', 'Sulfa drugs', 'Shellfish'],
      emergencyContact: {
        name: 'Michael Johnson',
        relationship: 'Spouse',
        phone: '+1 (555) 123-4567',
        email: 'michael.j@example.com',
      },
      isAnonymized: false,
    },
  })
  console.log('✓ Patient profile')

  // Medical records
  const records = await Promise.all([
    prisma.medicalRecord.create({
      data: {
        userId: user.id,
        title: 'Annual Blood Panel',
        type: 'lab',
        date: new Date('2024-02-15'),
        provider: 'City Medical Center',
        sourceType: 'FHIR',
        notes: 'Routine annual bloodwork. All markers within normal range.',
      },
    }),
    prisma.medicalRecord.create({
      data: {
        userId: user.id,
        title: 'Primary Care Visit',
        type: 'visit',
        date: new Date('2024-02-01'),
        provider: 'Dr. Emily Chen',
        sourceType: 'MANUAL',
        notes: 'Annual wellness checkup. Blood pressure 118/76. Discussed lifestyle changes.',
      },
    }),
    prisma.medicalRecord.create({
      data: {
        userId: user.id,
        title: 'Chest X-Ray',
        type: 'imaging',
        date: new Date('2024-01-20'),
        provider: 'Radiology Associates',
        sourceType: 'OCR',
        isEdited: true,
        notes: 'Clear lungs. No abnormalities detected.',
      },
    }),
    prisma.medicalRecord.create({
      data: {
        userId: user.id,
        title: 'Lipid Panel Results',
        type: 'lab',
        date: new Date('2024-01-10'),
        provider: 'LabCorp',
        sourceType: 'FHIR',
        notes: 'LDL slightly elevated at 132 mg/dL. Follow up in 3 months.',
      },
    }),
    prisma.medicalRecord.create({
      data: {
        userId: user.id,
        title: 'Dermatology Consultation',
        type: 'visit',
        date: new Date('2023-12-18'),
        provider: 'Dr. Mark Williams',
        sourceType: 'MANUAL',
        notes: 'Reviewed skin concerns. Prescribed topical retinol cream.',
      },
    }),
  ])
  console.log(`✓ ${records.length} medical records`)

  // Observations
  await prisma.observation.createMany({
    data: [
      { userId: user.id, recordId: records[0].id, type: 'Hemoglobin', value: '13.8', unit: 'g/dL', date: new Date('2024-02-15'), referenceRange: '12.0-17.5', isAbnormal: false },
      { userId: user.id, recordId: records[0].id, type: 'WBC', value: '7.2', unit: 'K/uL', date: new Date('2024-02-15'), referenceRange: '4.5-11.0', isAbnormal: false },
      { userId: user.id, recordId: records[3].id, type: 'LDL Cholesterol', value: '132', unit: 'mg/dL', date: new Date('2024-01-10'), referenceRange: '<100', isAbnormal: true },
      { userId: user.id, recordId: records[3].id, type: 'HDL Cholesterol', value: '58', unit: 'mg/dL', date: new Date('2024-01-10'), referenceRange: '>40', isAbnormal: false },
    ],
  })
  console.log('✓ Observations')

  // Conditions
  await prisma.condition.createMany({
    data: [
      { userId: user.id, name: 'Hypertension (Stage 1)', status: 'active', onsetDate: new Date('2023-06-01') },
      { userId: user.id, name: 'Hyperlipidemia', status: 'active', onsetDate: new Date('2024-01-10') },
      { userId: user.id, name: 'Acute Sinusitis', status: 'resolved', onsetDate: new Date('2023-11-01'), resolvedDate: new Date('2023-11-15') },
    ],
  })
  console.log('✓ Conditions')

  // Medications
  const med1 = await prisma.medication.create({
    data: { userId: user.id, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', startDate: new Date('2023-06-01'), isActive: true, prescribedBy: 'Dr. Emily Chen', notes: 'Take in the morning with water.' },
  })
  const med2 = await prisma.medication.create({
    data: { userId: user.id, name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime', startDate: new Date('2024-01-15'), isActive: true, prescribedBy: 'Dr. Emily Chen', notes: 'Monitor for muscle pain.' },
  })
  const med3 = await prisma.medication.create({
    data: { userId: user.id, name: 'Vitamin D3', dosage: '2000 IU', frequency: 'Once daily', startDate: new Date('2023-09-01'), isActive: true, notes: 'OTC supplement.' },
  })
  await prisma.medication.create({
    data: { userId: user.id, name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', startDate: new Date('2023-11-01'), endDate: new Date('2023-11-10'), isActive: false, prescribedBy: 'Dr. Sarah Park', notes: 'Completed course for sinus infection.' },
  })
  console.log('✓ Medications')

  // Medication logs (last 7 days)
  const today = new Date()
  for (let d = 0; d < 7; d++) {
    const day = new Date(today)
    day.setDate(day.getDate() - d)
    for (const med of [med1, med2, med3]) {
      await prisma.medicationLog.create({
        data: {
          userId: user.id,
          medicationId: med.id,
          scheduledTime: day,
          takenAt: Math.random() > 0.15 ? day : null,
          status: Math.random() > 0.15 ? 'TAKEN' : 'MISSED',
        },
      })
    }
  }
  console.log('✓ Medication logs')

  // Symptom logs
  await prisma.symptomLog.createMany({
    data: [
      { userId: user.id, symptomName: 'Headache', severity: 5, notes: 'Started after lunch.', date: new Date('2024-02-20') },
      { userId: user.id, symptomName: 'Fatigue', severity: 4, notes: 'Feeling tired despite 8 hours of sleep.', date: new Date('2024-02-19') },
      { userId: user.id, symptomName: 'Back Pain', severity: 3, notes: 'Lower back after long desk session.', date: new Date('2024-02-18') },
      { userId: user.id, symptomName: 'Headache', severity: 7, notes: 'Severe migraine with light sensitivity.', date: new Date('2024-02-15') },
      { userId: user.id, symptomName: 'Nausea', severity: 4, notes: 'Brief nausea in the morning.', date: new Date('2024-02-12') },
      { userId: user.id, symptomName: 'Fatigue', severity: 6, notes: 'Exhausted after travel.', date: new Date('2024-02-10') },
      { userId: user.id, symptomName: 'Headache', severity: 3, notes: 'Mild headache, resolved with water.', date: new Date('2024-02-08') },
    ],
  })
  console.log('✓ Symptom logs')

  // Notes
  await prisma.note.createMany({
    data: [
      { userId: user.id, recordId: records[1].id, title: 'Dr. Chen Visit Notes', content: 'Discussed reducing sodium intake. She recommended the DASH diet. Follow-up in 6 months. BP goal is under 120/80.', appointmentDate: new Date('2024-02-01'), tags: ['cardiology', 'diet', 'blood-pressure'] },
      { userId: user.id, title: 'Pharmacy Questions', content: 'Ask about generic options for Atorvastatin. Check insurance coverage for vitamin supplements.', tags: ['pharmacy', 'insurance'] },
      { userId: user.id, recordId: records[3].id, title: 'Lipid Panel Follow-up', content: 'LDL at 132 – target is under 100. Increase fiber intake, add omega-3. Retest in March.', appointmentDate: new Date('2024-04-10'), tags: ['cholesterol', 'diet', 'labs'] },
    ],
  })
  console.log('✓ Notes')

  // Provider connections
  await prisma.providerConnection.createMany({
    data: [
      { userId: user.id, providerName: 'City Medical Center', providerType: 'Hospital', status: 'connected', lastSynced: new Date('2024-02-15'), endpoint: 'https://fhir.citymedical.example.com' },
      { userId: user.id, providerName: 'LabCorp', providerType: 'Laboratory', status: 'connected', lastSynced: new Date('2024-01-10'), endpoint: 'https://api.labcorp.example.com' },
      { userId: user.id, providerName: 'CVS Health', providerType: 'Pharmacy', status: 'pending', endpoint: null },
    ],
  })
  console.log('✓ Provider connections')

  console.log('\n✅ Seed complete! Demo user: sarah.johnson@example.com')
  console.log(`   User ID: ${user.id}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

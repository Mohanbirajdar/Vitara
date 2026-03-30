// Core entity types

export interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
  createdAt: Date
  updatedAt: Date
}

export interface PatientProfile {
  id: string
  userId: string
  dateOfBirth: Date | null
  bloodType: string | null
  height: number | null
  weight: number | null
  allergies: string[]
  emergencyContact: EmergencyContact | null
  isAnonymized: boolean
  createdAt: Date
  updatedAt: Date
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
}

export type SourceType = 'FHIR' | 'MANUAL' | 'OCR'

export interface MedicalRecord {
  id: string
  userId: string
  title: string
  type: string
  date: Date
  provider: string | null
  sourceType: SourceType
  isHidden: boolean
  isEdited: boolean
  originalData: Record<string, unknown> | null
  editedData: Record<string, unknown> | null
  notes: string | null
  attachmentUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Observation {
  id: string
  recordId: string | null
  userId: string
  type: string
  value: string
  unit: string | null
  date: Date
  referenceRange: string | null
  isAbnormal: boolean
  createdAt: Date
}

export interface Condition {
  id: string
  userId: string
  name: string
  status: string
  onsetDate: Date | null
  resolvedDate: Date | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Medication {
  id: string
  userId: string
  name: string
  dosage: string
  frequency: string
  startDate: Date
  endDate: Date | null
  isActive: boolean
  prescribedBy: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export type MedicationStatus = 'TAKEN' | 'MISSED' | 'SKIPPED'

export interface MedicationLog {
  id: string
  medicationId: string
  userId: string
  scheduledTime: Date
  takenAt: Date | null
  status: MedicationStatus
  notes: string | null
  createdAt: Date
}

export interface SymptomLog {
  id: string
  userId: string
  symptomName: string
  severity: number
  notes: string | null
  date: Date
  createdAt: Date
}

export interface Note {
  id: string
  userId: string
  recordId: string | null
  title: string
  content: string
  appointmentDate: Date | null
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ProviderConnection {
  id: string
  userId: string
  providerName: string
  providerType: string
  status: string
  lastSynced: Date | null
  authToken: string | null
  endpoint: string | null
  createdAt: Date
  updatedAt: Date
}

// UI/Display types
export interface StatCard {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: string
  color: string
}

export interface TimelineItem {
  id: string
  date: Date
  title: string
  type: 'lab' | 'visit' | 'medication' | 'condition' | 'symptom' | 'note'
  provider?: string
  summary?: string
  isExpanded?: boolean
}

export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Form types
export interface SymptomFormData {
  symptomName: string
  severity: number
  notes?: string
  date: string
}

export interface MedicationFormData {
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  prescribedBy?: string
  notes?: string
}

export interface NoteFormData {
  title: string
  content: string
  appointmentDate?: string
  tags?: string[]
  recordId?: string
}

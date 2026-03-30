import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d, yyyy')
}

export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMMM d, yyyy')
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'h:mm a')
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function getRecordTypeColor(type: string): string {
  const colors: Record<string, string> = {
    lab: 'bg-blue-100 text-blue-700 border-blue-200',
    visit: 'bg-purple-100 text-purple-700 border-purple-200',
    medication: 'bg-green-100 text-green-700 border-green-200',
    condition: 'bg-red-100 text-red-700 border-red-200',
    symptom: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    note: 'bg-gray-100 text-gray-700 border-gray-200',
    imaging: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    procedure: 'bg-pink-100 text-pink-700 border-pink-200',
  }
  return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200'
}

export function getSeverityColor(severity: number): string {
  if (severity <= 3) return 'text-green-600 bg-green-50'
  if (severity <= 6) return 'text-yellow-600 bg-yellow-50'
  return 'text-red-600 bg-red-50'
}

export function getSeverityLabel(severity: number): string {
  if (severity <= 2) return 'Mild'
  if (severity <= 4) return 'Moderate'
  if (severity <= 7) return 'Significant'
  return 'Severe'
}

export function getStatusBadge(status: string): string {
  const badges: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-600',
    resolved: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-700',
    connected: 'bg-green-100 text-green-700',
    disconnected: 'bg-red-100 text-red-700',
    error: 'bg-red-100 text-red-700',
    TAKEN: 'bg-green-100 text-green-700',
    MISSED: 'bg-red-100 text-red-700',
    SKIPPED: 'bg-yellow-100 text-yellow-700',
  }
  return badges[status] || 'bg-gray-100 text-gray-600'
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function bloodTypeOptions(): string[] {
  return ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
}

export function calculateAge(dateOfBirth: Date | string): number {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age
}

export function calculateBMI(height: number, weight: number): number {
  // height in cm, weight in kg
  const heightM = height / 100
  return Math.round((weight / (heightM * heightM)) * 10) / 10
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' }
  if (bmi < 25) return { label: 'Normal weight', color: 'text-green-600' }
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-600' }
  return { label: 'Obese', color: 'text-red-600' }
}

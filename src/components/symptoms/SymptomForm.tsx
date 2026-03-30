'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import type { SymptomLog } from '@/types'
import { cn } from '@/lib/utils'

const commonSymptoms = [
  'Headache', 'Fatigue', 'Back Pain', 'Nausea', 'Dizziness',
  'Shortness of Breath', 'Chest Pain', 'Joint Pain', 'Insomnia', 'Anxiety',
]

interface SymptomFormProps {
  onSubmit: (data: Omit<SymptomLog, 'id' | 'userId' | 'createdAt'>) => void
  onCancel: () => void
}

export function SymptomForm({ onSubmit, onCancel }: SymptomFormProps) {
  const [symptomName, setSymptomName] = useState('')
  const [severity, setSeverity] = useState(5)
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const severityColor = severity <= 3 ? 'text-emerald-600 bg-emerald-50'
    : severity <= 6 ? 'text-yellow-600 bg-yellow-50'
    : 'text-red-600 bg-red-50'

  const severityLabel = severity <= 3 ? 'Mild' : severity <= 6 ? 'Moderate' : 'Severe'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!symptomName.trim()) return
    onSubmit({
      symptomName,
      severity,
      notes: notes || null,
      date: new Date(date),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Quick select */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
          Quick Select
        </label>
        <div className="flex flex-wrap gap-2">
          {commonSymptoms.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setSymptomName(s)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                symptomName === s
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Symptom name */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
          Symptom Name *
        </label>
        <input
          value={symptomName}
          onChange={e => setSymptomName(e.target.value)}
          placeholder="e.g., Headache, Fatigue..."
          required
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
        />
      </div>

      {/* Severity slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Severity</label>
          <div className={cn('px-3 py-1 rounded-full text-sm font-bold', severityColor)}>
            {severity}/10 · {severityLabel}
          </div>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={severity}
          onChange={e => setSeverity(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-200 accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1.5">
          <span>1 – Mild</span>
          <span>5 – Moderate</span>
          <span>10 – Severe</span>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any additional details..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-500/20">
          <CheckCircle className="h-4 w-4" /> Log Symptom
        </button>
      </div>
    </form>
  )
}

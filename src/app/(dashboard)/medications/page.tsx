'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pill, Plus, X, Check, CheckCircle2, XCircle, BarChart3 } from 'lucide-react'
import { MedicationCard } from '@/components/medications/MedicationCard'
import { medicationAdherence } from '@/lib/mock-data'
import type { Medication } from '@/types'
import { format } from 'date-fns'

export default function MedicationsPage() {
  const [meds, setMeds] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')
  const [todayDoses, setTodayDoses] = useState<Record<string, 'taken' | 'missed' | null>>({})
  const [form, setForm] = useState({ name: '', dosage: '', frequency: '', startDate: '', prescribedBy: '', notes: '' })

  useEffect(() => {
    fetch('/api/medications')
      .then(r => r.json())
      .then(json => {
        const data: Medication[] = json.data || []
        setMeds(data)
        // Initialize today's doses for active meds
        const doses: Record<string, 'taken' | 'missed' | null> = {}
        data.filter(m => m.isActive).forEach(m => { doses[m.id] = null })
        setTodayDoses(doses)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const activeMeds = meds.filter(m => m.isActive)
  const pastMeds = meds.filter(m => !m.isActive)

  const markDose = (id: string, status: 'taken' | 'missed') => {
    setTodayDoses(p => ({ ...p, [id]: status }))
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name: form.name,
      dosage: form.dosage,
      frequency: form.frequency,
      startDate: form.startDate,
      prescribedBy: form.prescribedBy || null,
      notes: form.notes || null,
    }
    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.data) {
        setMeds(p => [json.data, ...p])
        setTodayDoses(d => ({ ...d, [json.data.id]: null }))
      }
    } catch {
      // fallback: add locally
      const newMed: Medication = {
        id: `med-${Date.now()}`,
        userId: 'user-1',
        name: form.name,
        dosage: form.dosage,
        frequency: form.frequency,
        startDate: new Date(form.startDate),
        endDate: null,
        isActive: true,
        prescribedBy: form.prescribedBy || null,
        notes: form.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setMeds(p => [newMed, ...p])
      setTodayDoses(d => ({ ...d, [newMed.id]: null }))
    }
    setShowAdd(false)
    setForm({ name: '', dosage: '', frequency: '', startDate: '', prescribedBy: '', notes: '' })
  }

  const takenCount = Object.values(todayDoses).filter(v => v === 'taken').length
  const totalToday = activeMeds.length

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="h-6 w-6 text-indigo-600" />
            Medications
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage prescriptions and track adherence</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add
        </motion.button>
      </motion.div>

      {/* Today's doses card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 mb-5 text-white shadow-xl shadow-indigo-500/20"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider">Today&apos;s Doses</p>
            <p className="text-lg font-bold mt-0.5">{format(new Date(), 'EEEE, MMMM d')}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{takenCount}/{totalToday}</p>
            <p className="text-indigo-200 text-xs">taken</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-indigo-500/30 rounded-full h-2 mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: totalToday > 0 ? `${(takenCount / totalToday) * 100}%` : '0%' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Quick mark */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse h-14 rounded-xl bg-white/10" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {activeMeds.map(med => (
              <div key={med.id} className="flex items-center justify-between bg-white/10 rounded-xl p-3">
                <div>
                  <p className="text-sm font-semibold">{med.name}</p>
                  <p className="text-indigo-200 text-xs">{med.dosage} · {med.frequency}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => markDose(med.id, 'taken')}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${todayDoses[med.id] === 'taken' ? 'bg-emerald-400' : 'bg-white/20 hover:bg-white/30'}`}
                  >
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </button>
                  <button
                    onClick={() => markDose(med.id, 'missed')}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${todayDoses[med.id] === 'missed' ? 'bg-red-400' : 'bg-white/20 hover:bg-white/30'}`}
                  >
                    <XCircle className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
            {activeMeds.length === 0 && (
              <p className="text-indigo-200 text-sm text-center py-2">No active medications</p>
            )}
          </div>
        )}
      </motion.div>

      {/* Adherence stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 shadow-sm"
      >
        <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-indigo-500" />
          30-Day Adherence
        </h2>
        <div className="space-y-3">
          {medicationAdherence.map(({ name, taken, total, percentage }) => (
            <div key={name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-700 font-medium">{name}</span>
                <span className="text-sm font-bold text-slate-800">{percentage}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${percentage >= 90 ? 'bg-emerald-500' : percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-14 text-right">{taken}/{total} days</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-4">
        {(['active', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab === 'active' ? `Active (${activeMeds.length})` : `History (${pastMeds.length})`}
          </button>
        ))}
      </div>

      {/* Medication cards */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="h-4 bg-slate-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {(activeTab === 'active' ? activeMeds : pastMeds).map((med, i) => (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <MedicationCard medication={med} />
            </motion.div>
          ))}
          {(activeTab === 'active' ? activeMeds : pastMeds).length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Pill className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No medications in this list</p>
            </div>
          )}
        </div>
      )}

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Add Medication</h3>
                <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAdd} className="p-5 space-y-4">
                {[
                  { field: 'name', label: 'Medication Name', placeholder: 'e.g., Lisinopril', required: true },
                  { field: 'dosage', label: 'Dosage', placeholder: 'e.g., 10mg', required: true },
                  { field: 'frequency', label: 'Frequency', placeholder: 'e.g., Once daily', required: true },
                  { field: 'startDate', label: 'Start Date', placeholder: '', required: true, type: 'date' },
                  { field: 'prescribedBy', label: 'Prescribed By', placeholder: 'e.g., Dr. Chen' },
                ].map(({ field, label, placeholder, required, type }) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{label}</label>
                    <input
                      type={type || 'text'}
                      value={form[field as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                      placeholder={placeholder}
                      required={required}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Special instructions..."
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
                    <Check className="h-4 w-4" /> Add Medication
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

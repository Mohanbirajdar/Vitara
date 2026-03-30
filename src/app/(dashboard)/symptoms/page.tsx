'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, TrendingUp, Plus, X } from 'lucide-react'
import { SymptomChart } from '@/components/symptoms/SymptomChart'
import { SymptomForm } from '@/components/symptoms/SymptomForm'
import type { SymptomLog } from '@/types'
import { format } from 'date-fns'

const severityColor = (s: number) =>
  s <= 3 ? 'text-emerald-600 bg-emerald-50' :
  s <= 6 ? 'text-yellow-600 bg-yellow-50' :
  'text-red-600 bg-red-50'

const severityLabel = (s: number) =>
  s <= 3 ? 'Mild' : s <= 6 ? 'Moderate' : 'Severe'

export default function SymptomsPage() {
  const [showForm, setShowForm] = useState(false)
  const [logs, setLogs] = useState<SymptomLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSymptom, setSelectedSymptom] = useState<string>('All')

  useEffect(() => {
    fetch('/api/symptoms')
      .then(r => r.json())
      .then(json => { setLogs(json.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const symptoms = ['All', ...Array.from(new Set(logs.map(l => l.symptomName)))]

  const filteredLogs = selectedSymptom === 'All'
    ? logs
    : logs.filter(l => l.symptomName === selectedSymptom)

  const handleAdd = async (data: Omit<SymptomLog, 'id' | 'userId' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.data) {
        setLogs(prev => [json.data, ...prev])
      }
    } catch {
      // fallback: add locally
      const newLog: SymptomLog = {
        id: `sym-${Date.now()}`,
        userId: 'user-1',
        createdAt: new Date(),
        ...data,
      }
      setLogs(prev => [newLog, ...prev])
    }
    setShowForm(false)
  }

  // Stats
  const avgSeverity = logs.length
    ? (logs.reduce((s, l) => s + l.severity, 0) / logs.length).toFixed(1)
    : '—'
  const lastSeven = logs.filter(l => {
    const diff = (Date.now() - new Date(l.date).getTime()) / 86400000
    return diff <= 7
  })

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
            <Activity className="h-6 w-6 text-indigo-600" />
            Symptom Tracker
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Monitor symptoms and identify patterns over time</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Log Symptom
        </motion.button>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-5"
      >
        {[
          { label: 'Total Logged', value: loading ? null : logs.length, color: 'text-indigo-600' },
          { label: 'This Week', value: loading ? null : lastSeven.length, color: 'text-amber-600' },
          { label: 'Avg Severity', value: loading ? null : avgSeverity, color: 'text-slate-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 p-3.5 shadow-sm text-center">
            {value === null ? (
              <div className="h-8 w-10 mx-auto bg-slate-100 rounded animate-pulse mb-1" />
            ) : (
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            )}
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              Severity Trends
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Last 14 days</p>
          </div>
        </div>
        <SymptomChart />
      </motion.div>

      {/* Filter pills */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-thin"
      >
        {symptoms.map(s => (
          <button
            key={s}
            onClick={() => setSelectedSymptom(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedSymptom === s
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
            }`}
          >
            {s}
          </button>
        ))}
      </motion.div>

      {/* Logs list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-100 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${severityColor(log.severity)}`}>
                    {log.severity}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{log.symptomName}</p>
                    <p className="text-xs text-slate-400">
                      {format(new Date(log.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${severityColor(log.severity)}`}>
                  {severityLabel(log.severity)}
                </span>
              </div>
              {log.notes && (
                <p className="text-sm text-slate-500 mt-2.5 pl-12 leading-relaxed">{log.notes}</p>
              )}
            </motion.div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Activity className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No symptoms logged yet</p>
            </div>
          )}
        </div>
      )}

      {/* Log form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Log New Symptom</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <SymptomForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

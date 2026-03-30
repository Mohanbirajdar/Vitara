'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, Search, Clock } from 'lucide-react'
import { TimelineItem } from '@/components/timeline/TimelineItem'
import type { TimelineItem as TLItem, MedicalRecord, Medication, SymptomLog } from '@/types'

const FILTER_TYPES = ['All', 'Labs', 'Visits', 'Medications', 'Symptoms'] as const
type FilterType = typeof FILTER_TYPES[number]

const typeMap: Record<FilterType, string | null> = {
  All: null,
  Labs: 'lab',
  Visits: 'visit',
  Medications: 'medication',
  Symptoms: 'symptom',
}

function buildTimeline(
  records: MedicalRecord[],
  medications: Medication[],
  symptoms: SymptomLog[]
): TLItem[] {
  const recordItems: TLItem[] = records.map(r => ({
    id: r.id,
    date: r.date,
    title: r.title,
    type: r.type === 'lab' ? 'lab' : 'visit',
    provider: r.provider ?? undefined,
    summary: r.notes ?? undefined,
  }))

  const medItems: TLItem[] = medications
    .filter(m => !m.isActive)
    .map(m => ({
      id: m.id,
      date: m.startDate,
      title: `Started ${m.name}`,
      type: 'medication' as const,
      provider: m.prescribedBy ?? undefined,
      summary: `${m.dosage} – ${m.frequency}`,
    }))

  const symptomItems: TLItem[] = symptoms.map(s => ({
    id: s.id,
    date: s.date,
    title: s.symptomName,
    type: 'symptom' as const,
    summary: s.notes ?? `Severity: ${s.severity}/10`,
  }))

  return [...recordItems, ...medItems, ...symptomItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function TimelinePage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [allItems, setAllItems] = useState<TLItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/records?pageSize=100').then(r => r.json()),
      fetch('/api/medications').then(r => r.json()),
      fetch('/api/symptoms').then(r => r.json()),
    ])
      .then(([recordsJson, medsJson, symptomsJson]) => {
        const items = buildTimeline(
          recordsJson.data || [],
          medsJson.data || [],
          symptomsJson.data || []
        )
        setAllItems(items)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = allItems.filter(item => {
    const matchesFilter = typeMap[activeFilter] === null || item.type === typeMap[activeFilter]
    const matchesSearch = !search || item.title.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Group by month
  const grouped: Record<string, TLItem[]> = {}
  filtered.forEach(item => {
    const key = new Date(item.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(item)
  })

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="h-6 w-6 text-indigo-600" />
          Medical Timeline
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Your complete chronological health history</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-4"
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search timeline..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-sm"
        />
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-thin"
      >
        <Filter className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1.5" />
        {FILTER_TYPES.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeFilter === f
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
            }`}
          >
            {f}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex gap-4 items-center bg-white rounded-xl p-4 border border-slate-100">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-2.5 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Count */}
          <p className="text-xs text-slate-400 mb-4">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>

          {/* Timeline */}
          <div className="space-y-8">
            <AnimatePresence>
              {Object.entries(grouped).map(([month, items], gi) => (
                <motion.div
                  key={month}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: gi * 0.05 }}
                >
                  {/* Month label */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{month}</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  {/* Items */}
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />

                    <div className="space-y-3">
                      {items.map((item, idx) => (
                        <TimelineItem
                          key={item.id}
                          item={item}
                          isExpanded={expandedId === item.id}
                          onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                          index={idx}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Clock className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No records found</p>
                <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

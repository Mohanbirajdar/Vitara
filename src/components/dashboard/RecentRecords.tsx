'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FileText, FlaskConical, Stethoscope, Scan, ChevronRight, Upload } from 'lucide-react'
import { formatDate, getRecordTypeColor } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { MedicalRecord } from '@/types'

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  lab: FlaskConical,
  visit: Stethoscope,
  imaging: Scan,
  procedure: FileText,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

export function RecentRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/records?pageSize=4')
      .then(r => r.json())
      .then(json => { setRecords(json.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
        <h2 className="text-base font-semibold text-slate-900">Recent Records</h2>
        <Link href="/timeline">
          <Button variant="ghost" size="sm" className="text-primary-600 h-8 text-xs">
            View all <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="divide-y divide-slate-50">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
              <div className="h-9 w-9 rounded-xl bg-slate-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-2.5 bg-slate-100 rounded w-1/2" />
              </div>
              <div className="h-5 w-14 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="divide-y divide-slate-50"
        >
          {records.map((record) => {
            const Icon = typeIcons[record.type] || FileText
            const colorClass = getRecordTypeColor(record.type)

            return (
              <motion.div
                key={record.id}
                variants={itemVariants}
                whileHover={{ backgroundColor: 'rgb(248 250 252)' }}
                className="flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{record.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {record.provider && `${record.provider} · `}{formatDate(record.date)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5 capitalize">
                    {record.sourceType}
                  </Badge>
                  {record.isEdited && (
                    <Badge variant="info" className="text-[10px] px-2 py-0.5">
                      Edited
                    </Badge>
                  )}
                </div>
              </motion.div>
            )
          })}
          {records.length === 0 && (
            <div className="px-5 py-8 text-center text-slate-400 text-sm">
              No records found
            </div>
          )}
        </motion.div>
      )}

      <div className="px-5 py-4 border-t border-slate-50">
        <Link href="/upload">
          <Button variant="outline" size="sm" className="w-full text-sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload New Record
          </Button>
        </Link>
      </div>
    </div>
  )
}

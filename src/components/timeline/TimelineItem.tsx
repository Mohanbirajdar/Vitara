'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FlaskConical,
  Stethoscope,
  Scan,
  FileText,
  Pill,
  ChevronDown,
  ExternalLink,
  Edit2,
  EyeOff,
  AlertCircle,
} from 'lucide-react'
import { MedicalRecord } from '@/types'
import { formatDate, formatDateLong, getRecordTypeColor } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TimelineItemProps {
  record: MedicalRecord
  isFirst?: boolean
  isLast?: boolean
}

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  lab: { icon: FlaskConical, label: 'Lab Results' },
  visit: { icon: Stethoscope, label: 'Visit' },
  imaging: { icon: Scan, label: 'Imaging' },
  medication: { icon: Pill, label: 'Medication' },
  procedure: { icon: FileText, label: 'Procedure' },
  note: { icon: FileText, label: 'Note' },
}

const sourceConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'secondary' }> = {
  FHIR: { label: 'FHIR Sync', variant: 'info' },
  MANUAL: { label: 'Manual', variant: 'secondary' },
  OCR: { label: 'Scanned', variant: 'warning' },
}

// New lightweight component for the unified TLItem timeline
interface UnifiedTimelineItemProps {
  item: import('@/types').TimelineItem
  isExpanded: boolean
  onToggle: () => void
  index: number
}

const typeIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  lab: FlaskConical,
  visit: Stethoscope,
  medication: Pill,
  symptom: AlertCircle,
  condition: FileText,
  note: FileText,
}

const typeLabelMap: Record<string, string> = {
  lab: 'Lab Results',
  visit: 'Doctor Visit',
  medication: 'Medication',
  symptom: 'Symptom',
  condition: 'Condition',
  note: 'Note',
}

export function TimelineItem({ item, isExpanded, onToggle, index }: UnifiedTimelineItemProps) {
  const Icon = typeIconMap[item.type] || FileText
  const colorClass = getRecordTypeColor(item.type)
  const label = typeLabelMap[item.type] || 'Record'

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="relative flex gap-4 pl-8"
    >
      {/* Icon dot on the vertical line */}
      <div className={cn(
        'absolute left-0 flex h-10 w-10 items-center justify-center rounded-xl border-2 bg-white z-10',
        colorClass
      )}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Card */}
      <div className="flex-1 mb-3">
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <button
            onClick={onToggle}
            className="w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold', colorClass)}>{label}</span>
                {item.provider && <span>{item.provider}</span>}
                <span>{formatDate(item.date)}</span>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isExpanded && item.summary && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 border-t border-slate-50 pt-3">
                  <p className="text-xs text-slate-500 leading-relaxed">{item.summary}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export function TimelineItemCard({ record, isFirst, isLast }: TimelineItemProps) {
  const [expanded, setExpanded] = useState(false)
  const config = typeConfig[record.type] || { icon: FileText, label: 'Record' }
  const Icon = config.icon
  const colorClass = getRecordTypeColor(record.type)
  const source = sourceConfig[record.sourceType]

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl border-2 flex-shrink-0 z-10',
          colorClass,
          'bg-white'
        )}>
          <Icon className="h-4 w-4" />
        </div>
        {!isLast && (
          <div className="flex-1 w-0.5 bg-slate-100 mt-2" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <motion.div
          whileHover={{ shadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
          className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden"
        >
          {/* Header */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-slate-900">{record.title}</h3>
                {record.isEdited && (
                  <Badge variant="warning" className="text-[10px]">
                    <Edit2 className="h-2.5 w-2.5 mr-1" />
                    Edited
                  </Badge>
                )}
                {record.isHidden && (
                  <Badge variant="secondary" className="text-[10px]">
                    <EyeOff className="h-2.5 w-2.5 mr-1" />
                    Hidden
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                {record.provider && <span>{record.provider}</span>}
                {record.provider && <span>·</span>}
                <span>{formatDate(record.date)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant={source.variant} className="text-[10px] hidden sm:flex">
                {source.label}
              </Badge>
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </motion.div>
            </div>
          </button>

          {/* Expanded content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 border-t border-slate-50 pt-3 space-y-3">
                  {record.notes && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Notes</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{record.notes}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500">Record Type</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5 capitalize">{config.label}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500">Date</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5">{formatDateLong(record.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-xs flex-1">
                      <Edit2 className="h-3 w-3 mr-1.5" />
                      Edit Record
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs flex-1">
                      <ExternalLink className="h-3 w-3 mr-1.5" />
                      View Details
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-slate-400">
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

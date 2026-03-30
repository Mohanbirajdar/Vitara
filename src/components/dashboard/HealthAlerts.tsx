'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Alert {
  id: string
  type: 'warning' | 'info' | 'success'
  title: string
  message: string
}

const initialAlerts: Alert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'LDL Cholesterol Elevated',
    message: 'Your last lipid panel showed LDL at 132 mg/dL. Consider following up with your doctor.',
  },
  {
    id: '2',
    type: 'info',
    title: 'Medication Reminder',
    message: 'Atorvastatin is due tonight at bedtime. You have an 86% adherence rate this month.',
  },
  {
    id: '3',
    type: 'success',
    title: 'Records Synced',
    message: 'City Medical Center synced 3 new records on Feb 15.',
  },
]

const alertConfig = {
  warning: {
    icon: AlertTriangle,
    container: 'bg-amber-50 border-amber-200',
    icon_class: 'text-amber-500',
    title_class: 'text-amber-900',
    text_class: 'text-amber-700',
  },
  info: {
    icon: Info,
    container: 'bg-blue-50 border-blue-200',
    icon_class: 'text-blue-500',
    title_class: 'text-blue-900',
    text_class: 'text-blue-700',
  },
  success: {
    icon: CheckCircle,
    container: 'bg-emerald-50 border-emerald-200',
    icon_class: 'text-emerald-500',
    title_class: 'text-emerald-900',
    text_class: 'text-emerald-700',
  },
}

export function HealthAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)

  const dismiss = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  if (alerts.length === 0) return null

  return (
    <div className="space-y-2">
      <h2 className="text-base font-semibold text-slate-900 px-1">Health Alerts</h2>
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => {
          const config = alertConfig[alert.type]
          const Icon = config.icon

          return (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, x: -10, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 10, height: 0 }}
              transition={{ duration: 0.25 }}
              className={cn(
                'flex items-start gap-3 p-3.5 rounded-xl border',
                config.container
              )}
            >
              <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', config.icon_class)} />
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', config.title_class)}>{alert.title}</p>
                <p className={cn('text-xs mt-0.5 leading-relaxed', config.text_class)}>{alert.message}</p>
              </div>
              <button
                onClick={() => dismiss(alert.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

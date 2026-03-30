'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Upload, Activity, Pill, FileText, Stethoscope, Plus } from 'lucide-react'

const actions = [
  {
    label: 'Upload Record',
    href: '/upload',
    icon: Upload,
    color: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-200',
  },
  {
    label: 'Log Symptom',
    href: '/symptoms',
    icon: Activity,
    color: 'from-rose-500 to-rose-600',
    shadow: 'shadow-rose-200',
  },
  {
    label: 'Medications',
    href: '/medications',
    icon: Pill,
    color: 'from-emerald-500 to-emerald-600',
    shadow: 'shadow-emerald-200',
  },
  {
    label: 'Add Note',
    href: '/notes',
    icon: FileText,
    color: 'from-violet-500 to-violet-600',
    shadow: 'shadow-violet-200',
  },
  {
    label: 'Providers',
    href: '/providers',
    icon: Stethoscope,
    color: 'from-amber-500 to-amber-600',
    shadow: 'shadow-amber-200',
  },
  {
    label: 'New Record',
    href: '/timeline',
    icon: Plus,
    color: 'from-sky-500 to-sky-600',
    shadow: 'shadow-sky-200',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
}

export function QuickActions() {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
      <h2 className="text-base font-semibold text-slate-900 mb-4">Quick Actions</h2>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-3"
      >
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.href + action.label} href={action.href}>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2.5 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} shadow-md ${action.shadow} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-slate-600 text-center leading-tight">{action.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </motion.div>
    </div>
  )
}

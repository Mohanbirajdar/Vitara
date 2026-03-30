'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Pill, Calendar, Activity, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

export function StatCards() {
  const [recordsCount, setRecordsCount] = useState<number | null>(null)
  const [medsCount, setMedsCount] = useState<number | null>(null)
  const [symptomsCount, setSymptomsCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/records?pageSize=1')
      .then(r => r.json())
      .then(json => setRecordsCount(json.total ?? 0))
      .catch(() => setRecordsCount(0))
  }, [])

  useEffect(() => {
    fetch('/api/medications?isActive=true')
      .then(r => r.json())
      .then(json => setMedsCount(json.total ?? 0))
      .catch(() => setMedsCount(0))
  }, [])

  useEffect(() => {
    fetch('/api/symptoms')
      .then(r => r.json())
      .then(json => setSymptomsCount(json.total ?? 0))
      .catch(() => setSymptomsCount(0))
  }, [])

  const stats = [
    {
      title: 'Total Records',
      value: recordsCount,
      subtitle: '3 new this month',
      trend: '+14%',
      trendUp: true,
      icon: FileText,
      gradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Active Medications',
      value: medsCount,
      subtitle: 'Next dose in 2h',
      icon: Pill,
      gradient: 'from-emerald-50 to-green-50',
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Appointments',
      value: 2,
      subtitle: 'Next: Mar 15',
      icon: Calendar,
      gradient: 'from-violet-50 to-purple-50',
      iconBg: 'bg-violet-100 text-violet-600',
    },
    {
      title: 'Symptoms Logged',
      value: symptomsCount,
      subtitle: 'Last 30 days',
      trend: '-23%',
      trendUp: false,
      icon: Activity,
      gradient: 'from-rose-50 to-pink-50',
      iconBg: 'bg-rose-100 text-rose-600',
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
    >
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className={cn(
              'rounded-2xl bg-gradient-to-br p-4 border border-white/80 shadow-sm cursor-default',
              stat.gradient
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', stat.iconBg)}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              {stat.trend && (
                <div className={cn(
                  'flex items-center gap-0.5 text-xs font-medium',
                  stat.trendUp ? 'text-emerald-600' : 'text-rose-500'
                )}>
                  {stat.trendUp ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.trend}
                </div>
              )}
            </div>
            <div>
              {stat.value === null ? (
                <div className="h-8 w-12 bg-slate-200/60 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              )}
              <p className="text-sm font-medium text-slate-700 mt-0.5">{stat.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.subtitle}</p>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

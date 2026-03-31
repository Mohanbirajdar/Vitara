'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Search } from 'lucide-react'
import Link from 'next/link'
import { StatCards } from '@/components/dashboard/StatCards'
import { RecentRecords } from '@/components/dashboard/RecentRecords'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { HealthAlerts } from '@/components/dashboard/HealthAlerts'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>('')
  const [initials, setInitials] = useState<string>('U')

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(json => {
        const name = json.data?.name || json.data?.email?.split('@')[0] || 'there'
        setUserName(name)
        setInitials(name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2))
      })
      .catch(() => setUserName('there'))
  }, [])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl mx-auto px-4 pt-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">{today}</p>
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, {userName || '…'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Here&apos;s your health overview</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
            <Search className="h-4 w-4 text-slate-500" />
          </button>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
            <Bell className="h-4 w-4 text-slate-500" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-400 border border-white" />
          </button>
          <Link href="/settings">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 shadow-sm hover:bg-indigo-700 transition-colors">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Health score card */}
      <motion.div variants={item} className="mb-5">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 text-white shadow-xl shadow-indigo-500/20">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-indigo-400/10 translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">Health Score</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">84</span>
                <span className="text-indigo-300 text-sm mb-1">/100</span>
              </div>
              <p className="text-indigo-200 text-sm mt-1">Good — 2 items need attention</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative h-20 w-20">
                <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="3" strokeDasharray="84 16" strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">84%</span>
              </div>
            </div>
          </div>
          <div className="relative z-10 flex gap-4 mt-4 pt-4 border-t border-white/10">
            <div><p className="text-indigo-200 text-xs">Blood Pressure</p><p className="text-white text-sm font-semibold">118/76 mmHg</p></div>
            <div className="w-px bg-white/10" />
            <div><p className="text-indigo-200 text-xs">Resting HR</p><p className="text-white text-sm font-semibold">68 bpm</p></div>
            <div className="w-px bg-white/10" />
            <div><p className="text-indigo-200 text-xs">BMI</p><p className="text-white text-sm font-semibold">22.8</p></div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}><StatCards /></motion.div>
      <motion.div variants={item} className="mt-5"><HealthAlerts /></motion.div>
      <motion.div variants={item} className="mt-5"><QuickActions /></motion.div>
      <motion.div variants={item} className="mt-5"><RecentRecords /></motion.div>
    </motion.div>
  )
}

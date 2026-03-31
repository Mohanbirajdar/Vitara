'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Settings, Shield, Bell, Download, Trash2, ChevronRight, Heart, Camera, LogOut, QrCode, Link2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bloodType: '',
    height: '',
    weight: '',
    dob: '',
  })
  const [isAnonymized, setIsAnonymized] = useState(false)
  const [notifications, setNotifications] = useState({
    medicationReminders: true,
    appointmentAlerts: true,
    labResults: true,
    weeklyReport: false,
  })
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(json => {
        const u = json.data
        if (u) {
          setProfile({
            name: u.name || '',
            email: u.email || '',
            bloodType: u.patientProfile?.bloodType || '',
            height: u.patientProfile?.height?.toString() || '',
            weight: u.patientProfile?.weight?.toString() || '',
            dob: u.patientProfile?.dateOfBirth ? new Date(u.patientProfile.dateOfBirth).toISOString().split('T')[0] : '',
          })
          setIsAnonymized(u.patientProfile?.isAnonymized ?? false)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profile, isAnonymized }),
    })
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />)}
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
          <Settings className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Settings</h1>
          <p className="text-xs text-slate-500">Manage your account and preferences</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 mb-4">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {profile.name ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
            </div>
            <button className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center hover:bg-slate-50">
              <Camera className="h-3 w-3 text-slate-500" />
            </button>
          </div>
          <div>
            <p className="font-semibold text-slate-900">{profile.name || 'Your Name'}</p>
            <p className="text-sm text-slate-500">{profile.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <Heart className="h-3 w-3" /> Active patient
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Full Name</label>
              <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Email</label>
              <input value={profile.email} disabled className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-400 cursor-not-allowed" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Blood Type</label>
              <select value={profile.bloodType} onChange={e => setProfile(p => ({ ...p, bloodType: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                <option value="">—</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Height (cm)</label>
              <input type="number" value={profile.height} onChange={e => setProfile(p => ({ ...p, height: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Weight (kg)</label>
              <input type="number" value={profile.weight} onChange={e => setProfile(p => ({ ...p, weight: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Date of Birth</label>
            <input type="date" value={profile.dob} onChange={e => setProfile(p => ({ ...p, dob: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
          </div>

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleSave} disabled={isSaving} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-70">
            {isSaving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : saved ? <><CheckCircle className="h-4 w-4" /> Saved!</> : 'Save Changes'}
          </motion.button>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
        </div>
        <div className="space-y-3">
          {Object.entries(notifications).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-slate-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
              <button onClick={() => setNotifications(p => ({ ...p, [key]: !val }))} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${val ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${val ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Privacy</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Anonymize Data</p>
            <p className="text-xs text-slate-500 mt-0.5">Hide personal identifiers from exports</p>
          </div>
          <button onClick={() => setIsAnonymized(!isAnonymized)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isAnonymized ? 'bg-indigo-600' : 'bg-slate-200'}`}>
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${isAnonymized ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm divide-y divide-slate-50 mb-4">
        {[
          { label: 'Connected Providers', icon: Link2, href: '/providers' },
          { label: 'QR Health Card', icon: QrCode, href: '#' },
          { label: 'Export Records', icon: Download, href: '#' },
        ].map(({ label, icon: Icon, href }) => (
          <Link key={label} href={href} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-700">{label}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </Link>
        ))}
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 space-y-3">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors">
          <Trash2 className="h-4 w-4" /> Delete Account
        </button>
      </div>
    </motion.div>
  )
}

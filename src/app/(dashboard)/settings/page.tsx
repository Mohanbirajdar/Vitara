'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, User, Shield, Bell, Download, Trash2, ChevronRight, Heart, Camera, LogOut, QrCode, Link2 } from 'lucide-react'
import { mockUser, mockProfile } from '@/lib/mock-data'
import Link from 'next/link'

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: mockUser.name || '',
    email: mockUser.email,
    bloodType: mockProfile.bloodType || '',
    height: mockProfile.height?.toString() || '',
    weight: mockProfile.weight?.toString() || '',
    dob: '1988-03-15',
  })
  const [isAnonymized, setIsAnonymized] = useState(mockProfile.isAnonymized)
  const [notifications, setNotifications] = useState({
    medicationReminders: true,
    appointmentAlerts: true,
    labResults: true,
    weeklyReport: false,
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-indigo-600" />
          Settings
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your profile and preferences</p>
      </motion.div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 mb-6 text-white shadow-xl shadow-indigo-500/20"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
              <Camera className="h-3 w-3 text-indigo-600" />
            </button>
          </div>
          <div>
            <p className="text-lg font-bold">{profile.name}</p>
            <p className="text-indigo-200 text-sm">{profile.email}</p>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full bg-white/15 text-xs font-medium">{profile.bloodType || 'Blood type unknown'}</span>
              {mockProfile.allergies.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-400/30 text-xs font-medium">{mockProfile.allergies.length} allergies</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Personal Info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden"
      >
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <User className="h-4 w-4 text-indigo-600" />
          </div>
          <h2 className="font-semibold text-slate-800">Personal Information</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
              <input
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Date of Birth</label>
              <input
                type="date"
                value={profile.dob}
                onChange={e => setProfile(p => ({ ...p, dob: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Blood Type</label>
              <select
                value={profile.bloodType}
                onChange={e => setProfile(p => ({ ...p, bloodType: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Height (cm)</label>
              <input
                type="number"
                value={profile.height}
                onChange={e => setProfile(p => ({ ...p, height: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Weight (kg)</label>
              <input
                type="number"
                value={profile.weight}
                onChange={e => setProfile(p => ({ ...p, weight: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Known Allergies</label>
            <div className="flex flex-wrap gap-2">
              {mockProfile.allergies.map(a => (
                <span key={a} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-100">
                  {a}
                </span>
              ))}
              <button className="px-3 py-1.5 rounded-lg border border-dashed border-slate-300 text-slate-400 text-xs hover:border-indigo-300 hover:text-indigo-500 transition-colors">
                + Add
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden"
      >
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
            <Bell className="h-4 w-4 text-amber-600" />
          </div>
          <h2 className="font-semibold text-slate-800">Notifications</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            { key: 'medicationReminders', label: 'Medication Reminders', desc: 'Daily dose reminders' },
            { key: 'appointmentAlerts', label: 'Appointment Alerts', desc: '24h and 1h before visits' },
            { key: 'labResults', label: 'Lab Results', desc: 'New results from providers' },
            { key: 'weeklyReport', label: 'Weekly Health Report', desc: 'Summary of your week' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-slate-700">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
              <button
                onClick={() => setNotifications(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications[key as keyof typeof notifications] ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${notifications[key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Privacy & Research */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden"
      >
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
            <Shield className="h-4 w-4 text-emerald-600" />
          </div>
          <h2 className="font-semibold text-slate-800">Privacy & Research</h2>
        </div>
        <div className="p-4 space-y-4">
          {/* Research toggle */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700">Anonymous Research Contribution</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Share anonymized, de-identified health data to help improve medical research. No personally identifiable information is shared.
              </p>
            </div>
            <button
              onClick={() => setIsAnonymized(!isAnonymized)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${isAnonymized ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isAnonymized ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {isAnonymized && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 rounded-xl bg-emerald-50 border border-emerald-100"
            >
              <p className="text-xs font-semibold text-emerald-800 mb-2">Data shared anonymously:</p>
              <ul className="space-y-1">
                {['Age range (not exact DOB)', 'Condition categories (not specific diagnoses)', 'Medication classes (not exact names)', 'Lab value ranges (not exact numbers)'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs text-emerald-700">
                    <span className="h-1 w-1 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
            <div>
              <p className="text-sm font-medium text-slate-700">Emergency Access QR Code</p>
              <p className="text-xs text-slate-400">Shareable medical summary for emergencies</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-medium hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
              <QrCode className="h-3.5 w-3.5" /> View QR
            </button>
          </div>
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden"
      >
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
            <Download className="h-4 w-4 text-purple-600" />
          </div>
          <h2 className="font-semibold text-slate-800">Data Management</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            { icon: Download, label: 'Export All Records', desc: 'Download as PDF or JSON', color: 'text-purple-600' },
            { icon: Heart, label: 'View Hidden Records', desc: 'Soft-deleted records', color: 'text-slate-500' },
            { icon: Link2, label: 'Manage Providers', desc: 'Connected data sources', color: 'text-indigo-600', href: '/providers' },
          ].map(({ icon: Icon, label, desc, color, href }) => (
            <div key={label}>
              {href ? (
                <Link href={href} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </Link>
              ) : (
                <button className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Save & Sign out */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3 mb-6"
      >
        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all shadow-md ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/25'}`}
        >
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </Link>
        <button className="w-full py-3 rounded-xl text-red-500 text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
          <Trash2 className="h-4 w-4" /> Delete Account
        </button>
      </motion.div>

      <p className="text-center text-xs text-slate-300 mb-6">VITARA v0.1.0 · Built with care for your health</p>
    </div>
  )
}

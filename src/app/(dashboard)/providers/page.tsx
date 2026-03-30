'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, Plus, X, RefreshCw, Unlink, CheckCircle, AlertCircle, Clock, Loader2, Building2, FlaskConical, Pill } from 'lucide-react'
import type { ProviderConnection } from '@/types'
import { formatDistanceToNow } from 'date-fns'

const PROVIDER_TEMPLATES = [
  { name: 'Epic MyChart', type: 'Building2 System', endpoint: 'https://fhir.epic.example.com', icon: Building2 },
  { name: 'LabCorp', type: 'Laboratory', endpoint: 'https://api.labcorp.example.com', icon: FlaskConical },
  { name: 'CVS Health', type: 'Pharmacy', endpoint: 'https://api.cvs.example.com', icon: Pill },
  { name: 'Quest Diagnostics', type: 'Laboratory', endpoint: 'https://fhir.quest.example.com', icon: FlaskConical },
]

const statusConfig = {
  connected: { color: 'text-emerald-700 bg-emerald-50', dot: 'bg-emerald-500', icon: CheckCircle, label: 'Connected' },
  pending: { color: 'text-amber-700 bg-amber-50', dot: 'bg-amber-500', icon: Clock, label: 'Pending' },
  error: { color: 'text-red-700 bg-red-50', dot: 'bg-red-500', icon: AlertCircle, label: 'Error' },
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ProviderConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [form, setForm] = useState({ providerName: '', providerType: '', endpoint: '' })

  useEffect(() => {
    fetch('/api/providers')
      .then(r => r.json())
      .then(json => { setProviders(json.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSync = async (id: string) => {
    setSyncing(id)
    try {
      const res = await fetch('/api/providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'sync' }),
      })
      const json = await res.json()
      if (json.data) {
        setProviders(p => p.map(prov => prov.id === id ? json.data : prov))
      }
    } catch {
      // fallback update locally
      setProviders(p => p.map(prov => prov.id === id ? { ...prov, lastSynced: new Date(), status: 'connected' } : prov))
    }
    setSyncing(null)
  }

  const handleDisconnect = async (id: string) => {
    try {
      await fetch(`/api/providers?id=${id}`, { method: 'DELETE' })
    } catch {
      // ignore
    }
    setProviders(p => p.filter(prov => prov.id !== id))
  }

  const handleConnect = (template?: typeof PROVIDER_TEMPLATES[0]) => {
    if (template) {
      setForm({ providerName: template.name, providerType: template.type, endpoint: template.endpoint })
    }
    setShowAdd(true)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (json.data) {
        setProviders(p => [...p, json.data])
      }
    } catch {
      // fallback: add locally
      const newProvider: ProviderConnection = {
        id: `prov-${Date.now()}`,
        userId: 'user-1',
        providerName: form.providerName,
        providerType: form.providerType,
        status: 'pending',
        lastSynced: null,
        authToken: null,
        endpoint: form.endpoint || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setProviders(p => [...p, newProvider])
    }
    setShowAdd(false)
    setForm({ providerName: '', providerType: '', endpoint: '' })
  }

  const typeIcon = (type: string) => {
    if (type.toLowerCase().includes('lab')) return FlaskConical
    if (type.toLowerCase().includes('pharmacy')) return Pill
    return Building2
  }

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
            <Link2 className="h-6 w-6 text-indigo-600" />
            Data Sources
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage connected health providers (SMART on FHIR)</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleConnect()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Connect
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        {[
          { label: 'Connected', value: providers.filter(p => p.status === 'connected').length, color: 'text-emerald-600' },
          { label: 'Pending', value: providers.filter(p => p.status === 'pending').length, color: 'text-amber-600' },
          { label: 'Total', value: providers.length, color: 'text-indigo-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 p-3.5 text-center shadow-sm">
            {loading ? (
              <div className="h-8 w-8 mx-auto bg-slate-100 rounded animate-pulse mb-1" />
            ) : (
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            )}
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Connected providers */}
      <div className="space-y-3 mb-8">
        {loading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-100 rounded w-1/2" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))
        ) : (
          providers.map((provider, i) => {
            const cfg = statusConfig[provider.status as keyof typeof statusConfig] || statusConfig.pending
            const Icon = typeIcon(provider.providerType)
            const isSyncing = syncing === provider.id

            return (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 flex-shrink-0">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-slate-800 text-sm">{provider.providerName}</h3>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{provider.providerType}</p>
                    {provider.endpoint && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{provider.endpoint}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      {provider.lastSynced ? (
                        <span className="text-xs text-slate-400">
                          Synced {formatDistanceToNow(new Date(provider.lastSynced), { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Never synced</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSync(provider.id)}
                      disabled={isSyncing}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors disabled:opacity-50"
                    >
                      {isSyncing
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <RefreshCw className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDisconnect(provider.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Unlink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
        {!loading && providers.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">
            No providers connected yet
          </div>
        )}
      </div>

      {/* Suggested providers */}
      <div>
        <h2 className="font-semibold text-slate-700 text-sm mb-3 uppercase tracking-wide">Suggested Providers</h2>
        <div className="grid grid-cols-2 gap-3">
          {PROVIDER_TEMPLATES.filter(t => !providers.some(p => p.providerName === t.name)).map(template => {
            const Icon = template.icon
            return (
              <button
                key={template.name}
                onClick={() => handleConnect(template)}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 flex-shrink-0">
                  <Icon className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{template.name}</p>
                  <p className="text-xs text-slate-400">{template.type}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* FHIR info */}
      <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
        <p className="text-xs font-semibold text-blue-800 mb-1">SMART on FHIR Integration</p>
        <p className="text-xs text-blue-600 leading-relaxed">
          VITARA uses the SMART on FHIR standard to securely connect to your healthcare providers. Your credentials never leave your device — we use OAuth 2.0 for authentication.
        </p>
      </div>

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Connect Provider</h3>
                <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAdd} className="p-5 space-y-4">
                {[
                  { field: 'providerName', label: 'Provider Name', placeholder: 'e.g., City Hospital', required: true },
                  { field: 'providerType', label: 'Provider Type', placeholder: 'e.g., Hospital, Lab, Pharmacy', required: true },
                  { field: 'endpoint', label: 'FHIR Endpoint (optional)', placeholder: 'https://fhir.provider.com' },
                ].map(({ field, label, placeholder, required }) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">{label}</label>
                    <input
                      value={form[field as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                      placeholder={placeholder}
                      required={required}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    />
                  </div>
                ))}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2">
                    <Link2 className="h-4 w-4" /> Connect
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

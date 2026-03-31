'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, ChevronRight, ChevronLeft, Check,
  Activity, FileText, Pill, Stethoscope,
  Upload, Clock, Zap, Users, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Tag Input ─────────────────────────────────────────────
interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder: string
  suggestions?: string[]
}

function TagInput({ tags, onChange, placeholder, suggestions = [] }: TagInputProps) {
  const [input, setInput] = useState('')
  const add = (val: string) => {
    const v = val.trim()
    if (v && !tags.includes(v)) onChange([...tags, v])
    setInput('')
  }
  const remove = (t: string) => onChange(tags.filter(x => x !== t))
  return (
    <div className="space-y-2">
      <div className="min-h-[48px] flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:bg-white transition-all cursor-text">
        {tags.map(t => (
          <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-medium">
            {t}
            <button type="button" onClick={() => remove(t)} className="text-indigo-400 hover:text-indigo-700 ml-0.5 leading-none">×</button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input) }
            if (e.key === 'Backspace' && !input && tags.length) remove(tags[tags.length - 1])
          }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none py-0.5"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.filter(s => !tags.includes(s)).map(s => (
            <button key={s} type="button" onClick={() => add(s)}
              className="px-2.5 py-1 rounded-full border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 text-xs text-slate-500 transition-colors">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────
function StepHeader({ tag, title, highlight, subtitle }: { tag: string; title: string; highlight: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold mb-3">{tag}</span>
      <h2 className="text-2xl font-bold text-slate-900 mb-1.5">
        {title} <span className="text-indigo-600">{highlight}</span>
      </h2>
      <p className="text-sm text-slate-500 leading-relaxed">{subtitle}</p>
    </div>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

const iCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white transition-all appearance-none'

// ── Main ──────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const TOTAL = 5

  const [personal, setPersonal] = useState({ name: '', dob: '', gender: '', phone: '' })
  const [medical, setMedical] = useState({
    bloodType: '', height: '', weight: '',
    conditions: [] as string[],
    allergies: [] as string[],
    medications: [] as string[],
    familyHistory: [] as string[],
    surgicalHistory: '',
    emergencyName: '', emergencyPhone: '', emergencyRel: '',
  })
  const [lifestyle, setLifestyle] = useState({
    smoking: '', alcohol: '', exercise: '', sleep: '', diet: '', stress: '',
    goals: [] as string[],
  })
  const [consent, setConsent] = useState(false)

  const canProceed = (s: number) => {
    if (s === 1) return !!(personal.name.trim() && personal.dob && personal.gender)
    if (s === 5) return consent
    return true
  }

  const calcAge = (dob: string) => {
    if (!dob) return ''
    const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 86400000))
    return isNaN(age) ? '' : `${age} yrs`
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      await fetch('/api/auth/me', { method: 'POST' })
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: personal.name,
          dob: personal.dob,
          bloodType: medical.bloodType,
          height: medical.height,
          weight: medical.weight,
          allergies: [...medical.allergies],
          conditions: medical.conditions,
          familyHistory: medical.familyHistory,
          surgicalHistory: medical.surgicalHistory,
          lifestyle: {
            smoking: lifestyle.smoking, alcohol: lifestyle.alcohol,
            exercise: lifestyle.exercise, sleep: lifestyle.sleep,
            diet: lifestyle.diet, stress: lifestyle.stress,
            goals: lifestyle.goals,
          },
          emergencyContact: medical.emergencyName ? {
            name: medical.emergencyName,
            phone: medical.emergencyPhone,
            relationship: medical.emergencyRel,
          } : null,
        }),
      })
      router.push('/dashboard')
      router.refresh()
    } catch {
      setSaving(false)
    }
  }

  const GOALS = [
    'Organise my records', 'Understand test results', 'Manage chronic condition',
    'Track medications', 'Prepare for appointments', 'Manage family health', 'Contribute to research',
  ]

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  }
  const [dir, setDir] = useState(1)
  const next = () => { setDir(1); setStep(s => Math.min(s + 1, TOTAL)) }
  const prev = () => { setDir(-1); setStep(s => Math.max(s - 1, 1)) }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 flex flex-col items-center px-4 py-8 pb-16">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
          <Heart className="h-5 w-5 text-white fill-white/30" />
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">VITARA</span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex items-center">
          {['Personal', 'Medical', 'Lifestyle', 'Overview', 'Consent'].map((label, i) => {
            const n = i + 1
            const done = step > n
            const active = step === n
            return (
              <div key={n} className="flex flex-col items-center flex-1 relative">
                {n < 5 && (
                  <div className={cn('absolute top-3.5 left-[calc(50%+14px)] right-0 h-0.5 transition-all duration-500', done ? 'bg-indigo-500' : 'bg-slate-200')} />
                )}
                <div className={cn(
                  'relative z-10 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                  done ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : active ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md shadow-indigo-200'
                    : 'bg-white border-2 border-slate-200 text-slate-400'
                )}>
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : n}
                </div>
                <span className={cn('text-[10px] font-medium mt-1.5 hidden sm:block transition-colors', active ? 'text-indigo-600 font-semibold' : done ? 'text-indigo-400' : 'text-slate-400')}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden"
          >
            <div className="p-7 pb-2">

              {/* ── STEP 1: PERSONAL ── */}
              {step === 1 && (
                <>
                  <StepHeader tag="Step 1 of 5 · Personal Details" title="Let's start with" highlight="who you are" subtitle="Basic info to personalise your health experience. All data is encrypted and HIPAA-protected." />
                  <div className="space-y-4">
                    <Field label="Full Name *">
                      <input className={iCls} placeholder="Sarah Johnson" value={personal.name} onChange={e => setPersonal(p => ({ ...p, name: e.target.value }))} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Date of Birth *">
                        <input type="date" className={iCls} value={personal.dob} onChange={e => setPersonal(p => ({ ...p, dob: e.target.value }))} />
                      </Field>
                      <Field label="Age">
                        <input className={cn(iCls, 'bg-slate-100 cursor-not-allowed text-slate-400')} readOnly value={calcAge(personal.dob)} placeholder="Auto-calculated" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Biological Sex *">
                        <select className={iCls} value={personal.gender} onChange={e => setPersonal(p => ({ ...p, gender: e.target.value }))}>
                          <option value="">Select</option>
                          <option>Male</option><option>Female</option><option>Intersex</option><option>Prefer not to say</option>
                        </select>
                      </Field>
                      <Field label="Phone (optional)">
                        <input className={iCls} placeholder="+1 (555) 000-0000" value={personal.phone} onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))} />
                      </Field>
                    </div>
                  </div>
                </>
              )}

              {/* ── STEP 2: MEDICAL ── */}
              {step === 2 && (
                <>
                  <StepHeader tag="Step 2 of 5 · Medical Profile" title="Your" highlight="health history" subtitle="Seeds your health profile. You can always update or add records later via providers." />
                  <div className="space-y-5">
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Blood Type">
                        <select className={iCls} value={medical.bloodType} onChange={e => setMedical(p => ({ ...p, bloodType: e.target.value }))}>
                          <option value="">Unknown</option>
                          {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </Field>
                      <Field label="Height (cm)">
                        <input className={iCls} placeholder="170" value={medical.height} onChange={e => setMedical(p => ({ ...p, height: e.target.value }))} />
                      </Field>
                      <Field label="Weight (kg)">
                        <input className={iCls} placeholder="70" value={medical.weight} onChange={e => setMedical(p => ({ ...p, weight: e.target.value }))} />
                      </Field>
                    </div>
                    <Field label="Current Medical Conditions">
                      <TagInput tags={medical.conditions} onChange={v => setMedical(p => ({ ...p, conditions: v }))} placeholder="Type condition, press Enter…" suggestions={['Hypertension', 'Type 2 Diabetes', 'Asthma', 'Hypothyroidism', 'GERD', 'Arthritis', 'None']} />
                    </Field>
                    <Field label="Allergies (drugs, food, other)">
                      <TagInput tags={medical.allergies} onChange={v => setMedical(p => ({ ...p, allergies: v }))} placeholder="e.g. Penicillin, Peanuts, Latex…" suggestions={['Penicillin', 'Sulfa drugs', 'NSAIDs', 'Peanuts', 'Shellfish', 'None']} />
                    </Field>
                    <Field label="Current Medications">
                      <TagInput tags={medical.medications} onChange={v => setMedical(p => ({ ...p, medications: v }))} placeholder="e.g. Metformin 500mg, Lisinopril 10mg…" />
                    </Field>
                    <Field label="Family Medical History">
                      <TagInput tags={medical.familyHistory} onChange={v => setMedical(p => ({ ...p, familyHistory: v }))} placeholder="e.g. Father: Heart disease…" suggestions={['Heart disease', 'Diabetes', 'Cancer', 'Stroke', 'None known']} />
                    </Field>
                    <Field label="Previous Surgeries (optional)">
                      <textarea className={cn(iCls, 'resize-none')} rows={2} placeholder="e.g. Appendectomy (2018), Knee replacement (2021)…" value={medical.surgicalHistory} onChange={e => setMedical(p => ({ ...p, surgicalHistory: e.target.value }))} />
                    </Field>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Emergency Contact</p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <Field label="Name">
                          <input className={iCls} placeholder="Full name" value={medical.emergencyName} onChange={e => setMedical(p => ({ ...p, emergencyName: e.target.value }))} />
                        </Field>
                        <Field label="Relationship">
                          <select className={iCls} value={medical.emergencyRel} onChange={e => setMedical(p => ({ ...p, emergencyRel: e.target.value }))}>
                            <option value="">Select</option>
                            <option>Spouse / Partner</option><option>Parent</option><option>Sibling</option><option>Child</option><option>Friend</option><option>Other</option>
                          </select>
                        </Field>
                      </div>
                      <Field label="Phone">
                        <input className={iCls} placeholder="+1 (555) 000-0000" value={medical.emergencyPhone} onChange={e => setMedical(p => ({ ...p, emergencyPhone: e.target.value }))} />
                      </Field>
                    </div>
                  </div>
                </>
              )}

              {/* ── STEP 3: LIFESTYLE ── */}
              {step === 3 && (
                <>
                  <StepHeader tag="Step 3 of 5 · Lifestyle & Goals" title="Your" highlight="daily habits" subtitle="Helps VITARA deliver personalised health insights and proactive care alerts." />
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { label: 'Smoking Status', key: 'smoking', opts: ['Never smoked', 'Former smoker', 'Current smoker', 'Vapes', 'Prefer not to say'] },
                        { label: 'Alcohol', key: 'alcohol', opts: ['None', 'Occasional (1-2/week)', 'Moderate (3-7/week)', 'Heavy (8+/week)', 'Prefer not to say'] },
                        { label: 'Exercise Frequency', key: 'exercise', opts: ['Rarely or never', '1-2 days/week', '3-4 days/week', '5+ days/week'] },
                        { label: 'Sleep (hrs/night)', key: 'sleep', opts: ['Less than 5', '5-6 hours', '7-8 hours', 'More than 8'] },
                        { label: 'Diet', key: 'diet', opts: ['No restrictions', 'Vegetarian', 'Vegan', 'Gluten-free', 'Diabetic diet', 'Low sodium', 'Keto'] },
                        { label: 'Stress Level', key: 'stress', opts: ['Low — relaxed', 'Moderate', 'High', 'Very high'] },
                      ] as { label: string; key: string; opts: string[] }[]).map(({ label, key, opts }) => (
                        <Field key={key} label={label}>
                          <select className={iCls} value={(lifestyle as unknown as Record<string, string>)[key]} onChange={e => setLifestyle(p => ({ ...p, [key]: e.target.value }))}>
                            <option value="">Select</option>
                            {opts.map(o => <option key={o}>{o}</option>)}
                          </select>
                        </Field>
                      ))}
                    </div>
                    <Field label="Health Goals (select all that apply)">
                      <div className="flex flex-wrap gap-2 mt-1">
                        {GOALS.map(g => (
                          <button key={g} type="button"
                            onClick={() => setLifestyle(p => ({ ...p, goals: p.goals.includes(g) ? p.goals.filter(x => x !== g) : [...p.goals, g] }))}
                            className={cn('px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
                              lifestyle.goals.includes(g) ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600')}>
                            {g}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>
                </>
              )}

              {/* ── STEP 4: FEATURES OVERVIEW ── */}
              {step === 4 && (
                <>
                  <StepHeader tag="Step 4 of 5 · How VITARA Helps" title="Your personal" highlight="health platform" subtitle="Everything VITARA will do for you — all in one secure, private space." />
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { icon: Clock, color: 'bg-indigo-100 text-indigo-600', title: 'Unified Timeline', desc: 'All your records — labs, visits, imaging — in one view.' },
                      { icon: Pill, color: 'bg-emerald-100 text-emerald-600', title: 'Medication Tracking', desc: 'Track meds, log doses, and get reminders.' },
                      { icon: Activity, color: 'bg-rose-100 text-rose-600', title: 'Symptom Logging', desc: 'Log symptoms, spot patterns, share with doctors.' },
                      { icon: FileText, color: 'bg-violet-100 text-violet-600', title: 'Smart Notes', desc: 'Prepare questions and keep visit summaries.' },
                      { icon: Stethoscope, color: 'bg-amber-100 text-amber-600', title: 'Provider Connect', desc: 'Connect to healthcare systems and auto-sync.' },
                      { icon: Upload, color: 'bg-sky-100 text-sky-600', title: 'OCR Upload', desc: 'Photograph paper records — AI digitises them.' },
                      { icon: Users, color: 'bg-pink-100 text-pink-600', title: 'Family Vault', desc: 'Manage records for your whole family.' },
                      { icon: Zap, color: 'bg-orange-100 text-orange-600', title: 'Care Alerts', desc: 'AI alerts you when screenings or follow-ups are due.' },
                    ].map(({ icon: Icon, color, title, desc }) => (
                      <div key={title} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
                        <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center mb-2', color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-semibold text-slate-800 mb-0.5">{title}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <Shield className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-700 leading-relaxed">
                      <span className="font-semibold">Your data stays yours.</span> HIPAA-compliant, end-to-end encrypted, never sold. Export or delete everything at any time.
                    </p>
                  </div>
                </>
              )}

              {/* ── STEP 5: CONSENT ── */}
              {step === 5 && (
                <>
                  <StepHeader tag="Step 5 of 5 · Privacy & Consent" title="Your data," highlight="your choice" subtitle="Review how we protect your information before creating your account." />
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">How VITARA protects your data</p>
                      <ul className="space-y-2">
                        {[
                          'All health data encrypted with AES-256 at rest, TLS 1.3 in transit',
                          'Only you can access your records — no VITARA staff can view them',
                          'Compliant with HIPAA Privacy and Security Rules',
                          'Delete your account and all data anytime, no questions asked',
                          'We will never sell your health data to advertisers or data brokers',
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                            <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={3} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => setConsent(!consent)}
                      className={cn(
                        'w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all',
                        consent ? 'border-indigo-500 bg-indigo-50/60' : 'border-slate-200 bg-white hover:border-indigo-300'
                      )}
                    >
                      <div className={cn(
                        'flex h-5 w-5 min-w-[20px] items-center justify-center rounded-md border-2 mt-0.5 transition-all',
                        consent ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'
                      )}>
                        {consent && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 mb-1.5">
                          I agree to VITARA&apos;s Terms of Service, Privacy Policy, and consent to processing my health data
                          <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 uppercase tracking-wide align-middle">Required</span>
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          You confirm you are 18+ and agree to our{' '}
                          <span className="underline cursor-pointer">Terms of Service</span> and{' '}
                          <span className="underline cursor-pointer">Privacy Policy</span>.
                          VITARA stores and processes your health records to deliver records unification, medication tracking, and your Emergency Health Card.
                          All data is encrypted and only accessible to you. You can withdraw consent and delete all your data at any time from Settings.
                        </p>
                      </div>
                    </button>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <span className="font-medium text-slate-500">Your rights:</span> Update preferences or request full account deletion anytime from Settings → Privacy. VITARA never shares personal health data with government agencies, advertisers, or data brokers.
                      </p>
                    </div>
                  </div>
                </>
              )}

            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-7 py-5 mt-4 border-t border-slate-50">
              {step > 1 ? (
                <button onClick={prev} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
              ) : (
                <a href="/login" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  Already have an account? <span className="text-indigo-600 font-medium">Sign in</span>
                </a>
              )}

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium tabular-nums">{step} / {TOTAL}</span>
                {step < TOTAL ? (
                  <motion.button
                    whileHover={{ scale: canProceed(step) ? 1.02 : 1 }}
                    whileTap={{ scale: canProceed(step) ? 0.97 : 1 }}
                    onClick={next}
                    disabled={!canProceed(step)}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                      canProceed(step)
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    )}
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: consent && !saving ? 1.02 : 1 }}
                    whileTap={{ scale: consent && !saving ? 0.97 : 1 }}
                    onClick={handleFinish}
                    disabled={!consent || saving}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                      consent && !saving
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    )}
                  >
                    {saving ? (
                      <><div className="h-4 w-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" /> Saving…</>
                    ) : (
                      <><Check className="h-4 w-4" strokeWidth={3} /> Create My Account</>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Skip link */}
        {step <= 3 && (
          <div className="text-center mt-4">
            <button onClick={() => { setDir(1); setStep(5) }} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              Skip to consent →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

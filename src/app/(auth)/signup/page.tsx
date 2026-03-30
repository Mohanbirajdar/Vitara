'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield, Check } from 'lucide-react'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    window.location.href = '/dashboard'
  }

  const passwordStrength = formData.password.length === 0 ? 0
    : formData.password.length < 6 ? 1
    : formData.password.length < 10 ? 2 : 3

  const strengthColors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-emerald-400']
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong']

  return (
    <div className="min-h-screen flex">
      {/* Left – Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-600 to-indigo-700 items-center justify-center p-12">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 rounded-full bg-teal-300/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 max-w-md text-white"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
              <Heart className="h-6 w-6 text-white fill-white/30" />
            </div>
            <span className="text-2xl font-bold tracking-tight">VITARA</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-4">
            Start your health journey today
          </h1>
          <p className="text-emerald-100 text-lg leading-relaxed mb-10">
            Join thousands who&apos;ve taken control of their medical data. Free forever, no credit card required.
          </p>

          {[
            'Secure, HIPAA-inspired data handling',
            'Connect unlimited health providers',
            'Lifetime access to your records',
            'Export anytime, no lock-in',
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3 mb-3"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 flex-shrink-0">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="text-emerald-100 text-sm">{item}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Right – Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">VITARA</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h2>
          <p className="text-slate-500 text-sm mb-8">Free forever. No credit card needed.</p>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Sarah Johnson"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="sarah@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength === 1 ? 'text-red-500' : passwordStrength === 2 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                    {strengthLabels[passwordStrength]} password
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Shield className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-600">
                Your health data is encrypted and protected. We never sell or share your information.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors disabled:opacity-70 shadow-lg shadow-indigo-500/25"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create free account <ArrowRight className="h-4 w-4" /></>
              )}
            </motion.button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            By creating an account, you agree to our{' '}
            <Link href="#" className="text-indigo-600 hover:underline">Terms</Link> and{' '}
            <Link href="#" className="text-indigo-600 hover:underline">Privacy Policy</Link>
          </p>

          <p className="mt-4 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

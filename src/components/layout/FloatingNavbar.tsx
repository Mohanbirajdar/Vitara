'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Clock, Plus, Pill, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Timeline', href: '/timeline', icon: Clock },
  { label: 'Add', href: '/upload', icon: Plus, isSpecial: true },
  { label: 'Meds', href: '/medications', icon: Pill },
  { label: 'Profile', href: '/settings', icon: User },
]

export function FloatingNavbar() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 px-4 pointer-events-none">
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
        className="pointer-events-auto"
      >
        <div className="flex items-center gap-1 px-3 py-2 rounded-full border border-white/20 bg-white/80 backdrop-blur-xl shadow-2xl shadow-black/10">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href ||
              (item.href === '/dashboard' && pathname === '/') ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            if (item.isSpecial) {
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative mx-1"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30 text-white">
                      <Icon className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    {/* Glow effect */}
                    <motion.div
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 rounded-full bg-primary-500/20 blur-md -z-10"
                    />
                  </motion.div>
                </Link>
              )
            }

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative flex flex-col items-center justify-center h-12 w-14 rounded-2xl transition-colors duration-200"
                >
                  {/* Active background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-2xl bg-primary-50"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  <Icon
                    className={cn(
                      'h-5 w-5 relative z-10 transition-colors duration-200',
                      isActive ? 'text-primary-600' : 'text-slate-400'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  {/* Active dot indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeDot"
                      className="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary-600"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  <span
                    className={cn(
                      'text-[10px] font-medium relative z-10 leading-none mt-0.5 transition-colors duration-200',
                      isActive ? 'text-primary-600' : 'text-slate-400'
                    )}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </motion.nav>
    </div>
  )
}

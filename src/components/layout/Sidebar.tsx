'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Clock,
  Upload,
  Activity,
  Pill,
  FileText,
  Settings,
  Stethoscope,
  Heart,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Timeline', href: '/timeline', icon: Clock },
  { label: 'Upload Records', href: '/upload', icon: Upload },
  { label: 'Symptoms', href: '/symptoms', icon: Activity },
  { label: 'Medications', href: '/medications', icon: Pill },
  { label: 'Notes', href: '/notes', icon: FileText },
  { label: 'Providers', href: '/providers', icon: Stethoscope },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-slate-100 fixed left-0 top-0 bottom-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700">
          <Heart className="h-5 w-5 text-white" fill="white" />
        </div>
        <div>
          <span className="text-lg font-bold text-slate-900">VITARA</span>
          <p className="text-xs text-slate-400 -mt-0.5">Health Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 flex-shrink-0',
                    isActive ? 'text-primary-600' : 'text-slate-400'
                  )}
                />
                {item.label}
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-600" />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
            SJ
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">Sarah Johnson</p>
            <p className="text-xs text-slate-400 truncate">sarah@example.com</p>
          </div>
          <LogOut className="h-4 w-4 text-slate-400 flex-shrink-0" />
        </div>
      </div>
    </aside>
  )
}

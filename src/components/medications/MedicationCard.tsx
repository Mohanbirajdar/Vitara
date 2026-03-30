'use client'

import { motion } from 'framer-motion'
import { Pill, Clock, User, CheckCircle, XCircle, MinusCircle, MoreHorizontal } from 'lucide-react'
import { Medication } from '@/types'
import { formatDate, getStatusBadge } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MedicationCardProps {
  medication: Medication
  onMarkTaken?: (id: string) => void
  onMarkMissed?: (id: string) => void
}

export function MedicationCard({ medication, onMarkTaken, onMarkMissed }: MedicationCardProps) {
  const statusClass = medication.isActive
    ? 'bg-emerald-50 border-emerald-100'
    : 'bg-slate-50 border-slate-100'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      className={cn(
        'rounded-2xl border p-4 shadow-sm transition-all',
        statusClass
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0',
          medication.isActive
            ? 'bg-emerald-100 text-emerald-600'
            : 'bg-slate-100 text-slate-500'
        )}>
          <Pill className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-900">{medication.name}</h3>
            <Badge
              className={cn('text-[10px]', getStatusBadge(medication.isActive ? 'active' : 'inactive'))}
              variant="secondary"
            >
              {medication.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mt-0.5">
            {medication.dosage} · {medication.frequency}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Since {formatDate(medication.startDate)}
            </span>
            {medication.prescribedBy && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {medication.prescribedBy}
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-slate-400 flex-shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onMarkTaken?.(medication.id)} className="text-sm">
              <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
              Mark Taken
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMarkMissed?.(medication.id)} className="text-sm">
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
              Mark Missed
            </DropdownMenuItem>
            <DropdownMenuItem className="text-sm">
              <MinusCircle className="h-4 w-4 mr-2 text-slate-400" />
              Skip Dose
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {medication.isActive && (
        <div className="mt-3 flex gap-2">
          <Button
            variant="success"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onMarkTaken?.(medication.id)}
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            Taken
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs text-slate-500"
            onClick={() => onMarkMissed?.(medication.id)}
          >
            <XCircle className="h-3.5 w-3.5 mr-1.5" />
            Missed
          </Button>
        </div>
      )}
    </motion.div>
  )
}

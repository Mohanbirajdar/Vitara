'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { symptomTrendData } from '@/lib/mock-data'

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-3">
        <p className="text-xs font-semibold text-slate-600 mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-600 capitalize">{entry.name}:</span>
            <span className="font-semibold text-slate-900">{entry.value}/10</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function SymptomChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={symptomTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 10]}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
          iconType="circle"
          iconSize={8}
        />
        <Line
          type="monotone"
          dataKey="headache"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          dataKey="fatigue"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          dataKey="backPain"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

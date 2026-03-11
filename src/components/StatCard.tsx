import { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  accent?: boolean
}

export default function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <div className={accent ? 'card-accent' : 'card'}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`p-2 rounded-lg ${accent ? 'bg-c9-blue/10' : 'bg-slate-100'}`}>
            <span className="text-c9-blue">{icon}</span>
          </div>
        )}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  )
}

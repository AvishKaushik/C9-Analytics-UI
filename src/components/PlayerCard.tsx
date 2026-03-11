import { User } from 'lucide-react'

interface PlayerCardProps {
  name: string
  playerId: string
  kda?: number
  form?: string
  gamesPlayed?: number
  isSelected?: boolean
  onClick: () => void
}

export default function PlayerCard({ name, kda, form, gamesPlayed, isSelected, onClick }: PlayerCardProps) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl text-center transition-all duration-200 border-2 ${
        isSelected
          ? 'bg-c9-blue text-white border-c9-blue shadow-md'
          : 'bg-white border-slate-200 hover:border-c9-blue/50 hover:shadow-sm text-slate-800'
      }`}
    >
      <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
        isSelected ? 'bg-white/20' : 'bg-slate-100'
      }`}>
        <User size={20} className={isSelected ? 'text-white' : 'text-slate-400'} />
      </div>
      <p className="font-semibold text-sm">{name}</p>
      {kda !== undefined && (
        <p className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
          KDA: {kda.toFixed(2)}
        </p>
      )}
      {gamesPlayed !== undefined && (
        <p className={`text-xs ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
          {gamesPlayed} games
        </p>
      )}
      {form && (
        <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
          isSelected
            ? 'bg-white/20 text-white'
            : form === 'hot' ? 'bg-emerald-50 text-emerald-700'
            : form === 'cold' ? 'bg-red-50 text-red-700'
            : 'bg-slate-100 text-slate-500'
        }`}>
          {form}
        </span>
      )}
    </button>
  )
}

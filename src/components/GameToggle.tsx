import { useGame, GameType } from '../hooks/useGame'

const options: { value: GameType; label: string }[] = [
  { value: 'Valorant', label: 'VALORANT' },
  { value: 'lol', label: 'LoL' },
]

interface GameToggleProps {
  disabled?: boolean
}

export default function GameToggle({ disabled = false }: GameToggleProps) {
  const { game, setGame } = useGame()

  return (
    <div className={`flex bg-slate-100 rounded-lg p-0.5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          disabled={disabled}
          onClick={() => !disabled && setGame(opt.value)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
            game === opt.value
              ? 'bg-c9-blue text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          } ${disabled ? 'cursor-not-allowed' : ''}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

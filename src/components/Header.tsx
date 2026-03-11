import c9Logo from '../assets/c9_logo.png'
import { useGame } from '../hooks/useGame'

type Section = 'coach' | 'scout' | 'draft'
type GameType = 'Valorant' | 'lol'

interface HeaderProps {
  activeSection: Section
  onSectionChange: (section: Section) => void
  scoutGame?: GameType
  onScoutGameChange?: (game: GameType) => void
  disabled?: boolean
}

const sections = [
  { id: 'coach' as Section, label: 'Assistant Coach' },
  { id: 'scout' as Section, label: 'Scouting Report' },
  { id: 'draft' as Section, label: 'Draft Assistant' },
]

export default function Header({
  activeSection,
  onSectionChange,
  scoutGame,
  onScoutGameChange,
  disabled = false,
}: HeaderProps) {
  const { game: coachGame, setGame: setCoachGame } = useGame()

  const showGameToggle = activeSection === 'coach' || activeSection === 'scout'
  const currentGame = activeSection === 'coach' ? coachGame : scoutGame ?? 'Valorant'
  const handleGameChange = (g: GameType) => {
    if (activeSection === 'coach') setCoachGame(g)
    else onScoutGameChange?.(g)
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <img src={c9Logo} alt="C9" className="h-10 w-auto" />
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">C9 Analytics</h1>
            <p className="text-xs text-slate-400">Cloud9 Esports</p>
          </div>
        </div>

        {/* Section navigation */}
        <nav className="flex bg-slate-100 rounded-lg p-1 gap-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => !disabled && onSectionChange(s.id)}
              disabled={disabled}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                activeSection === s.id
                  ? 'bg-white text-c9-blue shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {/* Game toggle (Coach & Scout only) */}
        <div className="shrink-0">
          {showGameToggle ? (
            <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
              <button
                onClick={() => handleGameChange('Valorant')}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  currentGame === 'Valorant'
                    ? 'bg-white text-c9-blue shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                VALORANT
              </button>
              <button
                onClick={() => handleGameChange('lol')}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  currentGame === 'lol'
                    ? 'bg-white text-c9-blue shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                League of Legends
              </button>
            </div>
          ) : (
            <span className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-500 rounded-lg">
              LoL Only
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

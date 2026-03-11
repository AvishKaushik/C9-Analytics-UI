import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { useMutation } from '@tanstack/react-query'
import { Search, CheckCircle } from 'lucide-react'
import { scoutingApi, GameType } from '../api/scouting'

interface Props {
  game: GameType
  selectedTeam: { id: string; name: string } | null
  onSelectTeam: (team: { id: string; name: string }) => void
  placeholder?: string
}

export default function TeamSearch({ game, selectedTeam, onSelectTeam, placeholder = "Search team..." }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 400)
  const [showResults, setShowResults] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const searchMutation = useMutation({
    mutationFn: () => scoutingApi.searchTeams(searchQuery, game),
  })

  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      searchMutation.mutate()
    }
  }, [debouncedSearchQuery])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleSelectTeam = (team: any) => {
    onSelectTeam({ id: team.team_id, name: team.team_name })
    setSearchQuery(team.team_name)
    setShowResults(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setShowResults(true)
  }

  const handleInputFocus = () => {
    if (searchQuery.length >= 2 && searchMutation.data?.results?.length > 0) {
      setShowResults(true)
    }
  }

  const results = searchMutation.data?.results || []

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-10 py-2.5 text-slate-800 focus:outline-none focus:border-c9-blue focus:ring-2 focus:ring-c9-blue/20 placeholder-slate-400 text-sm transition-colors duration-200"
        />
        {searchMutation.isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-c9-blue"></div>
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((team: any) => (
            <button
              key={team.team_id}
              type="button"
              onClick={() => handleSelectTeam(team)}
              className={'w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between border-b border-slate-100 last:border-b-0 ' + (selectedTeam?.id === team.team_id ? 'bg-c9-accent' : '')}
            >
              <span className="font-medium text-slate-800">{team.team_name}</span>
              {selectedTeam?.id === team.team_id && <CheckCircle size={16} className="text-c9-blue" />}
            </button>
          ))}
        </div>
      )}

      {showResults && searchQuery.length >= 2 && !searchMutation.isPending && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-center text-slate-500 text-sm">
          No teams found
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Search, Shield, Swords, Users, Plus } from 'lucide-react'
import { draftApi } from '../../api/draft'
import Loading from '../../components/Loading'
import { useDebounce } from '../../hooks/useDebounce'

export default function ChampionSearchTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [composition, setComposition] = useState<string[]>([])

  const searchMutation = useMutation({
    mutationFn: (query: string) => draftApi.searchChampions(query),
  })

  const analysisMutation = useMutation({
    mutationFn: () => draftApi.analyzeComposition(composition),
  })

  // Live search effect
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      searchMutation.mutate(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery)
    }
  }

  const addToComposition = (name: string) => {
    if (composition.length < 5 && !composition.includes(name)) {
      setComposition([...composition, name])
    }
  }

  const removeFromComposition = (name: string) => {
    setComposition(composition.filter((c) => c !== name))
  }

  const handleAnalyze = () => {
    if (composition.length > 0) {
      analysisMutation.mutate()
    }
  }

  const searchResults = searchMutation.data?.results || []
  const analysis = analysisMutation.data

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search */}
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Champion Search</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search champion name (e.g. 'Ahri')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input flex-1"
          />
          <button onClick={handleSearch} className="btn btn-primary">
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* Loading */}
      {searchMutation.isPending && <Loading message="Searching..." />}

      {/* Search Results List */}
      {searchResults.length > 0 && searchQuery && (
        <div className="grid gap-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-semibold text-slate-700">
              Found {searchResults.length} champion{searchResults.length !== 1 ? 's' : ''}
            </h3>
          </div>

          <div className="grid md:grid-cols-1 gap-4">
            {searchResults.map((champion: any) => (
              <div key={champion.id} className="card border border-slate-100 hover:border-blue-200 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-800">{champion.name}</h3>
                      <div className="flex gap-1">
                        {champion.roles?.map((role: string) => (
                          <span key={role} className="badge badge-blue text-xs uppercase">{role}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-slate-600">
                      <span>Tier: <span className={`font-semibold ${champion.tier === 'S' || champion.tier === 'OP' ? 'text-purple-600' :
                          champion.tier === 'A' ? 'text-blue-600' : 'text-slate-600'
                        }`}>{champion.tier}</span></span>
                      <span>Win Rate: <span className="font-semibold text-emerald-600">{(champion.win_rate * 100).toFixed(1)}%</span></span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToComposition(champion.name)}
                    disabled={composition.length >= 5 || composition.includes(champion.name)}
                    className="btn btn-secondary btn-sm gap-2"
                  >
                    <Plus size={14} />
                    Add
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm bg-slate-50 p-3 rounded-lg">
                  {/* Synergies */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={14} className="text-emerald-500" />
                      <span className="font-medium text-slate-700">Synergies</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {champion.synergies?.slice(0, 3).map((s: string) => (
                        <span key={s} className="text-xs px-2 py-0.5 bg-white border border-emerald-100 text-emerald-700 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Counters */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Swords size={14} className="text-blue-500" />
                      <span className="font-medium text-slate-700">Counters</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {champion.counters?.slice(0, 3).map((c: string) => (
                        <span key={c} className="text-xs px-2 py-0.5 bg-white border border-blue-100 text-blue-700 rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>

                  {/* Countered By */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={14} className="text-red-500" />
                      <span className="font-medium text-slate-700">Countered By</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {champion.countered_by?.slice(0, 3).map((c: string) => (
                        <span key={c} className="text-xs px-2 py-0.5 bg-white border border-red-100 text-red-700 rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Composition Builder */}
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Composition Builder</h3>

        {composition.length === 0 ? (
          <p className="text-sm text-slate-500">Search and add champions to build a composition.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {composition.map((name) => (
                <button
                  key={name}
                  onClick={() => removeFromComposition(name)}
                  className="badge badge-blue hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  {name} ×
                </button>
              ))}
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analysisMutation.isPending}
              className="btn btn-primary"
            >
              Analyze Composition
            </button>
          </>
        )}
      </div>

      {/* Analysis Loading */}
      {analysisMutation.isPending && <Loading message="Analyzing composition..." />}

      {/* Analysis Results */}
      {analysis && (
        <div className="card animate-fade-in">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Composition Analysis</h3>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Composition Type</p>
              <p className="font-semibold text-slate-800">{analysis.composition_type}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Synergy Score</p>
              <p className="font-semibold text-c9-blue">{analysis.synergy_score?.toFixed(1)}/10</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-slate-500 mb-1">Win Condition</p>
            <p className="text-slate-700">{analysis.win_condition}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-2">Power Spikes</p>
              <ul className="space-y-1">
                {analysis.power_spikes?.map((spike: string, i: number) => (
                  <li key={i} className="text-sm text-emerald-600">• {spike}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-2">Weaknesses</p>
              <ul className="space-y-1">
                {analysis.weaknesses?.map((weak: string, i: number) => (
                  <li key={i} className="text-sm text-red-600">• {weak}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

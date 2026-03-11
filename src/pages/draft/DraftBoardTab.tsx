import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '../../hooks/useDebounce'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Search, Play, RotateCcw, CheckCircle, Sparkles } from 'lucide-react'
import { draftApi } from '../../api/draft'

export default function DraftBoardTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 400)
  const [selectedOpponent, setSelectedOpponent] = useState<{ id: string; name: string } | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [ourSide, setOurSide] = useState<'blue' | 'red'>('blue')
  const [draftState, setDraftState] = useState<any>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Champion Search State
  const [championSearchQuery, setChampionSearchQuery] = useState('')
  // debouncedChampionSearch removed
  const [showChampResults, setShowChampResults] = useState(false)

  // Prefetch meta champions for recommendations (used by recommendation engine)
  const { data: metaChampions } = useQuery({
    queryKey: ['metaChampions'],
    queryFn: () => draftApi.getMetaChampions(),
    enabled: !!draftState,
  })



  const searchMutation = useMutation({
    mutationFn: (initialQuery: string) => draftApi.searchTeams(initialQuery, 10),
  })

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      searchMutation.mutate(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery])

  useEffect(() => {
    if (searchQuery) setShowResults(true)
  }, [searchQuery])

  // Handle click outside for team search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleSelectOpponent = (team: any) => {
    setSelectedOpponent({ id: team.team_id, name: team.team_name })
    setSearchQuery(team.team_name)
    setShowResults(false)
  }

  const startDraftMutation = useMutation({
    mutationFn: () => draftApi.startDraft('125560', selectedOpponent!.id, ourSide), // C9 LoL team ID
    onSuccess: (data) => setDraftState(data),
  })

  const updateDraftMutation = useMutation({
    mutationFn: ({ champion, action, team }: { champion: string; action: 'pick' | 'ban'; team: 'blue' | 'red' }) =>
      draftApi.updateDraft(draftState.session_id, champion, action, team),
    onSuccess: (data) => {
      // Merge new data with existing state to preserve fields like our_side which aren't in update response
      setDraftState((prev: any) => ({ ...prev, ...data, our_side: prev.our_side }))
    },
  })

  const handleManualSelect = (champion: any) => {
    // Robustly find state values whether nested or flat
    const stateSource = draftState.state || draftState

    // Current team is already the side that needs to pick/ban
    const currentTeamSide = stateSource.current_team
    const currentAction = stateSource.current_action

    console.log('Manual Select:', { currentTeamSide, currentAction, champion })

    updateDraftMutation.mutate({
      champion: champion.name,
      action: currentAction,
      team: currentTeamSide
    })
    setChampionSearchQuery('')
    setShowChampResults(false)
  }

  const handleStartDraft = () => {
    if (selectedOpponent) {
      startDraftMutation.mutate()
    }
  }

  const handleReset = () => {
    setDraftState(null)
    setSelectedOpponent(null)
  }

  // If draft not started, show setup
  if (!draftState) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Start New Draft</h2>

          {/* Side Selection */}
          <div className="mb-6">
            <p className="text-sm text-slate-600 mb-2">Select Side</p>
            <div className="flex gap-3">
              <button
                onClick={() => setOurSide('blue')}
                className={`flex-1 py-4 rounded-lg border-2 transition-all ${ourSide === 'blue'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 hover:border-slate-300'
                  }`}
              >
                <span className="font-semibold">Blue Side</span>
                <p className="text-xs opacity-70 mt-1">First pick</p>
              </button>
              <button
                onClick={() => setOurSide('red')}
                className={`flex-1 py-4 rounded-lg border-2 transition-all ${ourSide === 'red'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-slate-200 hover:border-slate-300'
                  }`}
              >
                <span className="font-semibold">Red Side</span>
                <p className="text-xs opacity-70 mt-1">Counter pick</p>
              </button>
            </div>
          </div>

          {/* Opponent Search */}
          <div className="relative mb-4" ref={searchContainerRef}>
            <p className="text-sm text-slate-600 mb-2">Select Opponent</p>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search LoL team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchQuery.length >= 2 && searchMutation.data?.teams?.length > 0) setShowResults(true) }}
                className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-10 py-2.5 text-slate-800 focus:outline-none focus:border-c9-blue focus:ring-2 focus:ring-c9-blue/20 placeholder-slate-400 text-sm"
              />
              {searchMutation.isPending && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-c9-blue"></div>
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchMutation.data?.teams && searchMutation.data.teams.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchMutation.data.teams.map((team: any) => (
                  <button
                    key={team.team_id}
                    type="button"
                    onClick={() => handleSelectOpponent(team)}
                    className={'w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between border-b border-slate-100 last:border-b-0 ' + (selectedOpponent?.id === team.team_id ? 'bg-c9-accent' : '')}
                  >
                    <span className="font-medium text-slate-800">{team.team_name}</span>
                    {selectedOpponent?.id === team.team_id && <CheckCircle size={16} className="text-c9-blue" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedOpponent && (
            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-slate-600">Opponent:</p>
              <p className="font-semibold text-red-700">{selectedOpponent.name}</p>
            </div>
          )}

          <button
            onClick={handleStartDraft}
            disabled={!selectedOpponent || startDraftMutation.isPending}
            className="btn btn-primary w-full"
          >
            <Play size={16} className="mr-2" />
            Start Draft
          </button>
        </div>
      </div>
    )
  }

  // Draft Board UI
  const isBlue = draftState.our_side === 'blue'
  const currentPhase = draftState.state?.current_phase || 1
  const currentTeam = draftState.state?.current_team
  const currentAction = draftState.state?.current_action

  // Compute lists from state
  const ourBans = isBlue ? (draftState.state?.blue_bans || []) : (draftState.state?.red_bans || [])
  const theirBans = isBlue ? (draftState.state?.red_bans || []) : (draftState.state?.blue_bans || [])
  const ourPicks = isBlue ? (draftState.state?.blue_picks || []) : (draftState.state?.red_picks || [])
  const theirPicks = isBlue ? (draftState.state?.red_picks || []) : (draftState.state?.blue_picks || [])

  // Helper to render a slot
  const renderSlot = (input: any, isActive: boolean, isBan: boolean = false) => {
    // Handle DraftPick/DraftBan wrappers which contain the champion info nested
    const champion = input?.champion || input

    const champName = typeof champion === 'string' ? champion : champion?.name
    // DataDragon Image ID Exceptions
    const getImageId = (name: string) => {
      const exceptions: Record<string, string> = {
        "Wukong": "MonkeyKing",
        "Renata Glasc": "Renata",
        "Nunu & Willump": "Nunu",
        "Kai'Sa": "Kaisa",
        "Kog'Maw": "KogMaw",
        "Rek'Sai": "RekSai",
        "Vel'Koz": "VelKoz",
        "Cho'Gath": "ChoGath",
        "Kha'Zix": "KhaZix",
        "LeBlanc": "Leblanc",
        "Bel'Veth": "Belveth"
      }
      if (exceptions[name]) return exceptions[name]
      return name.replace(/[' .]/g, "")
    }

    const imageUrl = champion?.loading_image_url || ((typeof champion === 'string')
      ? `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${getImageId(champion)}_0.jpg`
      : null)

    return (
      <div className={`relative group transition-all duration-300 ${isActive ? 'scale-105 ring-2 ring-c9-blue z-10' : 'hover:scale-102'
        }`}>
        <div className={`
          w-20 h-36 md:w-24 md:h-44 rounded-lg overflow-hidden relative bg-slate-900 border-2
          ${isBan ? 'border-red-500/50' : 'border-slate-700'}
          ${champion ? 'border-opacity-100 shadow-lg' : 'border-dashed border-opacity-30'}
        `}>
          {imageUrl ? (
            <img src={imageUrl} alt={champName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold text-2xl">
              ?
            </div>
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Champion Name */}
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <p className="text-white text-xs font-bold truncate px-1">
              {champName || (isBan ? 'Ban' : 'Pick')}
            </p>
          </div>

          {/* Ban Icon Overlay */}
          {isBan && champion && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <RotateCcw className="text-red-500 w-8 h-8 opacity-80" />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Draft Session</h2>
            <span className="badge badge-blue">
              Phase {currentPhase}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {currentTeam === draftState.our_side
              ? "Your Turn to " + (currentAction === 'pick' ? 'Pick' : 'Ban')
              : "Waiting for Opponent..."}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Win Probability Pill */}
          {draftState.win_probability && (
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Win Probability</span>
              <span className={`text-2xl font-black ${draftState.win_probability.probability >= 0.55 ? 'text-green-500' :
                draftState.win_probability.probability <= 0.45 ? 'text-red-500' : 'text-slate-700'
                }`}>
                {(draftState.win_probability.probability * 100).toFixed(0)}%
              </span>
            </div>
          )}
          <div className="h-8 w-px bg-slate-200" />
          <button onClick={handleReset} className="btn btn-secondary text-xs">
            <RotateCcw size={14} className="mr-1" />
            Reset
          </button>
        </div>
      </div>

      {/* Main Draft Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Blue Team - Vertical Layout for Mobile, Side for Desktop */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-end space-y-4 order-2 lg:order-1">
          <div className="text-right w-full pr-2 border-b-2 border-blue-500 pb-2 mb-2">
            <h3 className="font-bold text-xl text-slate-800">{isBlue ? 'Cloud9' : selectedOpponent?.name}</h3>
            <p className="text-blue-600 font-semibold text-sm">Blue Side</p>
          </div>

          <div className="flex gap-2 flex-wrap justify-end">
            {/* Render Bans */}
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i}>
                {renderSlot((isBlue ? ourBans : theirBans)[i], false, true)}
              </div>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap justify-end">
            {/* Render Picks */}
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i}>
                {renderSlot((isBlue ? ourPicks : theirPicks)[i], false)}
              </div>
            ))}
          </div>
        </div>

        {/* Center Information / VS */}
        {/* Center Information / VS / Controls */}
        <div className="lg:col-span-2 flex flex-col items-center justify-start space-y-6 order-1 lg:order-2 py-4">

          {/* Draft Complete State */}
          {draftState.state?.is_complete ? (
            <div className="w-full text-center p-6 bg-white rounded-xl shadow-lg border-2 border-c9-blue animate-bounce-subtle">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-2" />
              <h3 className="text-2xl font-bold text-slate-800">Draft Complete</h3>
              <p className="text-slate-500 mb-4">Good luck in the game!</p>
              <button onClick={handleReset} className="btn btn-secondary w-full">
                <RotateCcw size={16} className="mr-2" />
                New Draft
              </button>
            </div>
          ) : (
            /* Champion Selector Control */
            <div className="w-full relative z-20">
              <div className={`p-4 rounded-xl border-2 shadow-sm transition-colors ${currentTeam === draftState.our_side
                ? 'bg-blue-50 border-blue-200'
                : 'bg-red-50 border-red-200'
                }`}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
                  {currentTeam === draftState.our_side ? "Your Turn" : "Opponent's Turn"}
                </p>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search champion..."
                    value={championSearchQuery}
                    className="input w-full pl-9 h-10 text-sm"
                    onChange={(e) => {
                      setChampionSearchQuery(e.target.value)
                      setShowChampResults(true)
                    }}
                    onFocus={() => setShowChampResults(true)}
                    onBlur={() => setTimeout(() => setShowChampResults(false), 200)}
                  />

                  {/* Results Dropdown - Client Side Filtered */}
                  {showChampResults && (
                    <div className="absolute top-12 left-0 right-0 bg-white rounded-lg shadow-xl border border-slate-200 max-h-60 overflow-y-auto z-50">
                      {(() => {
                        // Compute unavailable champions
                        const picks = [...(draftState.state?.blue_picks || []), ...(draftState.state?.red_picks || [])]
                        const bans = [...(draftState.state?.blue_bans || []), ...(draftState.state?.red_bans || [])]
                        const unavailable = new Set([...picks, ...bans].map((x: any) => x.champion?.name || x.champion))

                        // Filter meta champions
                        const filtered = metaChampions?.champions?.filter((c: any) => {
                          if (unavailable.has(c.name)) return false
                          if (!championSearchQuery) return true

                          const normalize = (s: string) => s.toLowerCase().replace(/['\s.]/g, '')
                          return normalize(c.name).includes(normalize(championSearchQuery))
                        }) || []

                        return filtered.length > 0 ? (
                          filtered.map((runner: any) => (
                            <button
                              key={runner.id}
                              onClick={() => handleManualSelect(runner)}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm font-medium flex items-center justify-between text-slate-800"
                            >
                              <div className="flex items-center gap-2">
                                {runner.image_url && <img src={runner.image_url} className="w-6 h-6 rounded-full" />}
                                <span>{runner.name}</span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-sm text-slate-500 text-center">No champions found</div>
                        )
                      })()}
                    </div>
                  )}
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                <div className="mt-3 flex justify-center">
                  <span className={`badge ${currentAction === 'ban' ? 'badge-red' : 'badge-green'}`}>
                    {currentAction?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Contextual Action Button */}
          {!draftState.state?.is_complete && draftState.recommendations?.length > 0 && currentTeam === draftState.our_side && (
            <div className="w-full animate-bounce-subtle">
              <div className="bg-gradient-to-r from-c9-blue to-blue-600 text-white p-4 rounded-xl shadow-lg shadow-blue-200 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => updateDraftMutation.mutate({
                  champion: draftState.recommendations[0].champion.name,
                  action: draftState.recommendations[0].action,
                  team: draftState.our_side
                })}
              >
                <p className="text-xs font-bold opacity-80 uppercase mb-1">Top Recommendation</p>
                <p className="font-bold text-lg">{draftState.recommendations[0].champion.name}</p>
                <p className="text-xs opacity-90 mt-1">{draftState.recommendations[0].reasoning[0]}</p>
              </div>
            </div>
          )}
        </div>

        {/* Red Team */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-start space-y-4 order-3">
          <div className="text-left w-full pl-2 border-b-2 border-red-500 pb-2 mb-2">
            <h3 className="font-bold text-xl text-slate-800">{!isBlue ? 'Cloud9' : selectedOpponent?.name}</h3>
            <p className="text-red-600 font-semibold text-sm">Red Side</p>
          </div>

          <div className="flex gap-2 flex-wrap justify-start">
            {/* Render Bans */}
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i}>
                {renderSlot((!isBlue ? ourBans : theirBans)[i], false, true)}
              </div>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap justify-start">
            {/* Render Picks */}
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i}>
                {renderSlot((!isBlue ? ourPicks : theirPicks)[i], false)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Recommendations & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Recommendations Panel */}
        <div className="card h-full">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-c9-blue" />
            AI Recommendations
          </h3>
          <div className="space-y-3">
            {!draftState.state?.is_complete && currentTeam === draftState.our_side && draftState.recommendations?.slice(0, 4).map((rec: any, i: number) => (
              <div key={i} className="group flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-c9-blue/30 hover:bg-slate-50 transition-all cursor-pointer">
                {rec.champion.image_url && (
                  <img src={rec.champion.image_url} alt={rec.champion.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">{rec.champion.name}</span>
                    <span className={`badge ${rec.action === 'ban' ? 'badge-red' : 'badge-green'}`}>
                      {rec.action?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{rec.reasoning[0]}</p>
                </div>
                <button
                  onClick={() => updateDraftMutation.mutate({
                    champion: rec.champion.name,
                    action: rec.action,
                    team: draftState.our_side
                  })}
                  className="btn btn-primary py-1 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Win Rate Analysis Panel */}
        <div className="card h-full">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            Impact Analysis
          </h3>

          {draftState.win_probability ? (
            <div className="space-y-4">
              {/* Win Rate Bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Predicted Composition Strength</span>
                  <span className="font-bold text-slate-800">{(draftState.win_probability.probability * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${draftState.win_probability.probability > 0.5 ? 'bg-gradient-to-r from-c9-blue to-green-400' : 'bg-gradient-to-r from-red-500 to-orange-400'
                      }`}
                    style={{ width: `${draftState.win_probability.probability * 100}%` }}
                  />
                </div>
              </div>

              {/* Factors */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Key Factors</p>
                {draftState.win_probability.factors.map((factor: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 p-2 rounded-lg">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-c9-blue flex-shrink-0" />
                    {factor}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm italic">
              Start draft to see analysis
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


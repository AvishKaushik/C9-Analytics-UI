import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Map, TrendingUp, TrendingDown } from 'lucide-react'
import { scoutingApi, GameType } from '../../api/scouting'
import TeamSearch from '../../components/TeamSearch'
import Loading from '../../components/Loading'

interface Props {
  game: GameType
}

export default function MapStatsTab({ game }: Props) {
  const [selectedTeam, setSelectedTeam] = useState<{ id: string; name: string } | null>(null)

  const mapStatsMutation = useMutation({
    mutationFn: () => scoutingApi.getMapStats(selectedTeam!.id, 10),
  })

  const handleAnalyze = () => {
    if (selectedTeam) {
      mapStatsMutation.mutate()
    }
  }

  const mapStats = mapStatsMutation.data?.maps || []

  if (game !== 'Valorant') {
    return (
      <div className="card animate-fade-in">
        <div className="text-center py-8">
          <Map size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">Map statistics are only available for VALORANT.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Section */}
      <div className="card overflow-visible">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Map Statistics</h2>
        <p className="text-sm text-slate-500 mb-4">
          Analyze a team's performance across different maps to identify strong and weak maps.
        </p>

        <div className="mb-4">
          <label className="text-sm text-slate-600 mb-2 block">Select Team to Analyze</label>
          <TeamSearch
            game={game}
            selectedTeam={selectedTeam}
            onSelectTeam={setSelectedTeam}
            placeholder="Search team..."
          />
        </div>

        {selectedTeam && (
          <div className="bg-c9-accent rounded-lg p-4 mb-4">
            <p className="text-sm text-slate-600">Analyzing:</p>
            <p className="font-semibold text-slate-800">{selectedTeam.name}</p>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!selectedTeam || mapStatsMutation.isPending}
          className="btn btn-primary"
        >
          <Map size={16} className="mr-2" />
          Get Map Stats
        </button>
      </div>

      {/* Loading */}
      {mapStatsMutation.isPending && <Loading message="Fetching map statistics..." />}

      {/* Map Stats Grid */}
      {mapStats.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {mapStats.map((map: any) => (
            <div key={map.map_name} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">{map.map_name}</h3>
                <span className="text-sm text-slate-500">{map.games_played} games</span>
              </div>

              {/* Win Rate */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">Win Rate</span>
                  <span className={`font-semibold ${map.win_rate >= 0.5 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(map.win_rate * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${map.win_rate >= 0.5 ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ width: `${map.win_rate * 100}%` }}
                  />
                </div>
              </div>

              {/* Attack/Defense */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-orange-600 mb-1">Attack</p>
                  <p className="font-semibold text-orange-700">
                    {((map.attack_win_rate || 0) * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-blue-600 mb-1">Defense</p>
                  <p className="font-semibold text-blue-700">
                    {((map.defense_win_rate || 0) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Recommendation */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                {map.win_rate >= 0.6 ? (
                  <div className="flex items-center gap-1 text-emerald-600 text-xs">
                    <TrendingUp size={12} />
                    <span>Strong map - prioritize in veto</span>
                  </div>
                ) : map.win_rate < 0.4 ? (
                  <div className="flex items-center gap-1 text-red-600 text-xs">
                    <TrendingDown size={12} />
                    <span>Weak map - consider banning</span>
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs">Neutral map</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

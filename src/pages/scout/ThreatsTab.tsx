import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Shield, AlertTriangle } from 'lucide-react'
import { scoutingApi, GameType } from '../../api/scouting'
import TeamSearch from '../../components/TeamSearch'
import Loading from '../../components/Loading'

interface Props {
  game: GameType
}

export default function ThreatsTab({ game }: Props) {
  const [selectedTeam, setSelectedTeam] = useState<{ id: string; name: string } | null>(null)

  const threatsMutation = useMutation({
    mutationFn: () => scoutingApi.getThreatRankings(selectedTeam!.id, game, 10),
  })

  const handleAnalyze = () => {
    if (selectedTeam) {
      threatsMutation.mutate()
    }
  }

  const threats = threatsMutation.data?.players || []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Section */}
      <div className="card overflow-visible">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Player Threat Analysis</h2>
        <p className="text-sm text-slate-500 mb-4">
          Identify the most dangerous players on an opponent team and how to neutralize them.
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
          disabled={!selectedTeam || threatsMutation.isPending}
          className="btn btn-primary"
        >
          <Shield size={16} className="mr-2" />
          Analyze Threats
        </button>
      </div>

      {/* Loading */}
      {threatsMutation.isPending && <Loading message="Analyzing player threats..." />}

      {/* Threat Rankings */}
      {threats.length > 0 && (
        <div className="card animate-fade-in">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Threat Rankings</h3>
          <div className="space-y-4">
            {threats.map((threat: any, i: number) => (
              <div key={threat.player_id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-slate-300">#{i + 1}</span>
                    <div>
                      <p className="font-semibold text-slate-800">{threat.player_name}</p>
                      <p className="text-xs text-slate-500">
                        Threat Score: <span className="font-medium text-slate-700">{threat.threat_score?.toFixed(1)}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${
                    threat.threat_level === 'High' ? 'badge-red' :
                    threat.threat_level === 'Medium' ? 'badge-yellow' : 'badge-green'
                  }`}>
                    <AlertTriangle size={12} className="mr-1" />
                    {threat.threat_level}
                  </span>
                </div>

                <p className="text-sm text-slate-600 mb-3">{threat.reasoning}</p>

                {threat.key_stats && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(threat.key_stats).map(([key, value]) => (
                      <div key={key} className="bg-slate-50 rounded px-2 py-1">
                        <span className="text-xs text-slate-500">{key.replace(/_/g, ' ')}: </span>
                        <span className="text-xs font-medium text-slate-700">
                          {typeof value === 'number' ? value.toFixed(2) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {threat.counter_tips?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Counter Tips:</p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {threat.counter_tips.map((tip: string, j: number) => (
                        <li key={j}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { FileText, CheckCircle, AlertCircle, Target } from 'lucide-react'
import { scoutingApi, GameType } from '../../api/scouting'
import TeamSearch from '../../components/TeamSearch'
import Loading from '../../components/Loading'

interface Props {
  game: GameType
}

export default function GenerateReportTab({ game }: Props) {
  const [selectedTeam, setSelectedTeam] = useState<{ id: string; name: string } | null>(null)
  const [numMatches, setNumMatches] = useState(10)

  const generateMutation = useMutation({
    mutationFn: () => scoutingApi.generateReport(selectedTeam!.id, game, numMatches),
  })

  const handleGenerate = () => {
    if (selectedTeam) {
      generateMutation.mutate()
    }
  }

  const report = generateMutation.data

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Section */}
      <div className="card overflow-visible">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Generate Scouting Report</h2>

        <div className="mb-4">
          <label className="text-sm text-slate-600 mb-2 block">Select Opponent Team</label>
          <TeamSearch
            game={game}
            selectedTeam={selectedTeam}
            onSelectTeam={setSelectedTeam}
            placeholder="Search opponent team..."
          />
        </div>

        {/* Selected Team */}
        {selectedTeam && (
          <div className="bg-c9-accent rounded-lg p-4 mb-4">
            <p className="text-sm text-slate-600 mb-1">Selected Opponent:</p>
            <p className="font-semibold text-slate-800">{selectedTeam.name}</p>
          </div>
        )}

        {/* Options */}
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm text-slate-600">Matches to analyze:</label>
          <input
            type="range"
            min="5"
            max="20"
            value={numMatches}
            onChange={(e) => setNumMatches(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="text-sm font-medium text-slate-800 w-6">{numMatches}</span>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!selectedTeam || generateMutation.isPending}
          className="btn btn-primary"
        >
          <FileText size={16} className="mr-2" />
          Generate Report
        </button>
      </div>

      {/* Loading */}
      {generateMutation.isPending && <Loading message="Generating scouting report..." />}

      {/* Report Display */}
      {report && (
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="card-accent">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{report.opponent_name}</h2>
                <p className="text-sm text-slate-500">Scouting Report • {new Date(report.generated_at).toLocaleDateString()}</p>
              </div>
              <span className="badge badge-blue">{report.game}</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Executive Summary</h3>
            <p className="text-slate-600 leading-relaxed">{report.executive_summary}</p>
          </div>

          {/* Team Profile */}
          {report.team_profile && (
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Team Profile</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Playstyle</p>
                  <p className="font-medium text-slate-800">{report.team_profile.playstyle}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Identity</p>
                  <p className="font-medium text-slate-800">{report.team_profile.identity}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-2">Strengths</p>
                  <ul className="space-y-1">
                    {report.team_profile.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-2">Weaknesses</p>
                  <ul className="space-y-1">
                    {report.team_profile.weaknesses?.map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Common Strategies Section */}
          {report.common_strategies && (
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Common Strategies</h3>
              <div className="space-y-3">
                {report.common_strategies.map((strategy: any, i: number) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-800">{strategy.name}</span>
                      <span className="text-xs text-slate-500">{strategy.frequency}% of games</span>
                    </div>
                    <p className="text-sm text-slate-600">{strategy.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game Patterns */}
          {(report.team_profile?.early_game_patterns?.length > 0 ||
            report.team_profile?.mid_game_patterns?.length > 0 ||
            report.team_profile?.late_game_patterns?.length > 0) && (
              <div className="card">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Common Patterns</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {report.team_profile.early_game_patterns?.length > 0 && (
                    <div className="bg-amber-50 rounded-lg p-3">
                      <p className="font-semibold text-amber-700 mb-2">Early Game</p>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {report.team_profile.early_game_patterns.map((p: string, i: number) => (
                          <li key={i}>• {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {report.team_profile.mid_game_patterns?.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="font-semibold text-blue-700 mb-2">Mid Game</p>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {report.team_profile.mid_game_patterns.map((p: string, i: number) => (
                          <li key={i}>• {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {report.team_profile.late_game_patterns?.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="font-semibold text-purple-700 mb-2">Late Game</p>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {report.team_profile.late_game_patterns.map((p: string, i: number) => (
                          <li key={i}>• {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Recent Compositions */}
          {report.recent_compositions?.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Compositions</h3>
              <div className="space-y-3">
                {report.recent_compositions.slice(0, 5).map((comp: any, i: number) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-500">{comp.games_played} games ({(comp.win_rate * 100).toFixed(0)}% WR)</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {comp.champions?.map((champ: string, j: number) => (
                        <span key={j} className="badge badge-blue">{champ}</span>
                      ))}
                      {comp.agents?.map((agent: string, j: number) => (
                        <span key={j} className="badge badge-blue">{agent}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Player Profiles */}
          {report.player_profiles?.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Player Tendencies</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {report.player_profiles.map((player: any) => (
                  <div key={player.player_id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-800">{player.player_name}</span>
                      <span className={`badge ${player.threat_level === 'High' ? 'badge-red' :
                          player.threat_level === 'Medium' ? 'badge-yellow' : 'badge-green'
                        }`}>
                        {player.threat_level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{player.role}</p>
                    {player.primary_picks?.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-slate-500 mb-1">Primary Picks:</p>
                        <div className="flex flex-wrap gap-1">
                          {player.primary_picks.slice(0, 3).map((pick: any, i: number) => (
                            <span key={i} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{pick.name}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {player.tendencies?.length > 0 && (
                      <ul className="text-xs text-slate-600 space-y-1">
                        {player.tendencies.slice(0, 2).map((t: string, i: number) => (
                          <li key={i}>• {t}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Findings */}
          {report.key_findings?.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Key Findings</h3>
              <ol className="space-y-2">
                {report.key_findings.map((finding: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-c9-blue text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-slate-700">{finding}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* How to Win */}
          {report.how_to_win && (
            <div className="card bg-emerald-50 border-emerald-200">
              <h3 className="text-lg font-semibold text-emerald-800 mb-3">How to Win</h3>
              <p className="text-emerald-700 leading-relaxed">{report.how_to_win}</p>
            </div>
          )}

          {/* Preparation Priorities */}
          {report.preparation_priorities?.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Preparation Priorities</h3>
              <ul className="space-y-2">
                {report.preparation_priorities.map((priority: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <Target size={14} className="text-c9-blue" />
                    <span className="text-slate-700">{priority}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

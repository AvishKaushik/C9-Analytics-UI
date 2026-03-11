import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Swords, CheckCircle, ArrowRight } from 'lucide-react'
import { scoutingApi, GameType } from '../../api/scouting'
import TeamSearch from '../../components/TeamSearch'
import Loading from '../../components/Loading'

interface Props {
  game: GameType
}

// Default Cloud9 team IDs
const C9_TEAM_IDS = { Valorant: '79', lol: '125560' }

export default function CounterStrategyTab({ game }: Props) {
  const [selectedOpponent, setSelectedOpponent] = useState<{ id: string; name: string } | null>(null)

  const strategyMutation = useMutation({
    mutationFn: () => scoutingApi.getCounterStrategy(selectedOpponent!.id, C9_TEAM_IDS[game], game),
  })

  const handleGenerate = () => {
    if (selectedOpponent) {
      strategyMutation.mutate()
    }
  }

  const strategy = strategyMutation.data as any

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Team Selection */}
      <div className="card overflow-visible">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Generate Counter Strategy</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Our Team */}
          <div className="bg-c9-accent rounded-lg p-4">
            <p className="text-sm text-slate-500 mb-1">Our Team</p>
            <p className="font-semibold text-c9-blue text-lg">Cloud9</p>
          </div>

          {/* Opponent */}
          <div>
            <p className="text-sm text-slate-500 mb-2">Select Opponent</p>
            <TeamSearch
              game={game}
              selectedTeam={selectedOpponent}
              onSelectTeam={setSelectedOpponent}
              placeholder="Search opponent team..."
            />
          </div>
        </div>

        {selectedOpponent && (
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-c9-accent rounded-lg px-4 py-2">
              <span className="font-medium text-c9-blue">Cloud9</span>
            </div>
            <ArrowRight className="text-slate-400" />
            <div className="bg-red-50 rounded-lg px-4 py-2">
              <span className="font-medium text-red-700">{selectedOpponent.name}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!selectedOpponent || strategyMutation.isPending}
          className="btn btn-primary"
        >
          <Swords size={16} className="mr-2" />
          Generate Counter Strategy
        </button>
      </div>

      {/* Loading */}
      {strategyMutation.isPending && <Loading message="Analyzing matchup..." />}

      {/* Strategy Display */}
      {strategy && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary */}
          {strategy.summary && (
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Strategy Summary</h3>
              <p className="text-slate-600 leading-relaxed">{strategy.summary}</p>
            </div>
          )}

          {/* Draft/Map Recommendations */}
          {(strategy.draft_recommendations?.length > 0 || strategy.map_recommendations?.length > 0) && (
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                {game === 'lol' ? 'Draft Priority' : 'Map Veto Strategy'}
              </h3>
              <div className="space-y-2">
                {(game === 'lol' ? strategy.draft_recommendations : strategy.map_recommendations)?.map((rec: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                    <CheckCircle size={18} className="text-c9-blue mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Win Conditions */}
          {strategy.win_conditions?.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Win Conditions</h3>
              <ol className="space-y-3">
                {strategy.win_conditions.map((condition: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-slate-700">{condition}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Detailed Recommendations */}
          {strategy.recommendations?.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Detailed Recommendations</h3>
              <div className="space-y-4">
                {strategy.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge ${
                        rec.priority === 'High' ? 'badge-red' :
                        rec.priority === 'Medium' ? 'badge-yellow' : 'badge-green'
                      }`}>
                        {rec.priority}
                      </span>
                      <span className="badge badge-blue">{rec.category}</span>
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-1">{rec.title}</h4>
                    <p className="text-sm text-slate-600 mb-3">{rec.description}</p>
                    {rec.execution_steps?.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Execution Steps:</p>
                        <ul className="text-sm text-slate-600 space-y-1">
                          {rec.execution_steps.map((step: string, j: number) => (
                            <li key={j}>• {step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Matchups */}
          {strategy.key_matchups?.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Key Matchups</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {strategy.key_matchups.map((matchup: any, i: number) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-c9-blue">{matchup.our_player}</span>
                      <span className="text-slate-400">vs</span>
                      <span className="font-medium text-red-600">{matchup.their_player}</span>
                    </div>
                    <span className={`badge ${
                      matchup.advantage === 'Favorable' ? 'badge-green' :
                      matchup.advantage === 'Unfavorable' ? 'badge-red' : 'badge-yellow'
                    }`}>
                      {matchup.advantage}
                    </span>
                    {matchup.tips?.length > 0 && (
                      <ul className="mt-2 text-xs text-slate-600 space-y-1">
                        {matchup.tips.map((tip: string, j: number) => (
                          <li key={j}>• {tip}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

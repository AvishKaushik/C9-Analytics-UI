import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getTeamMatches, analyzeWhatIf } from '../../api/insights'
import { useGame } from '../../hooks/useGame'
import Loading from '../../components/Loading'
import { Loader2, Lightbulb, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react'

export default function WhatIfTab() {
  const { game, teamId } = useGame()
  const [selectedMatch, setSelectedMatch] = useState('')
  const [scenario, setScenario] = useState('')

  const { data: matches } = useQuery({
    queryKey: ['matches', teamId, game],
    queryFn: () => getTeamMatches(teamId, game),
  })

  const whatIfMutation = useMutation({
    mutationFn: () => analyzeWhatIf(selectedMatch, game, scenario),
  })

  const matchList = matches?.data?.matches || []
  const result = whatIfMutation.data?.data

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-800">What-If Analysis</h2>
        <p className="text-sm text-slate-500">Explore alternative scenarios for past matches</p>
      </div>

      {/* Input */}
      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Select Match</label>
          <select
            value={selectedMatch}
            onChange={(e) => setSelectedMatch(e.target.value)}
            className="select w-full"
          >
            <option value="">Choose a match...</option>
            {matchList.map((m: any) => (
              <option key={m.series_id} value={m.series_id}>
                vs {m.opponent_name} ({m.result} {m.score})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Scenario Description</label>
          <textarea
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder={game === 'Valorant'
              ? "e.g., What if we had used Jett instead of Chamber on Haven?"
              : "e.g., What if we had focused on dragon control instead of pushing top?"
            }
            className="input w-full h-24 resize-none"
          />
        </div>
        <button
          onClick={() => whatIfMutation.mutate()}
          className="btn btn-primary flex items-center gap-2"
          disabled={!selectedMatch || !scenario.trim() || whatIfMutation.isPending}
        >
          {whatIfMutation.isPending && <Loader2 size={14} className="animate-spin" />}
          {whatIfMutation.isPending ? 'Analyzing...' : 'Analyze Scenario'}
        </button>
        {whatIfMutation.isError && (
          <p className="text-red-500 text-sm">Failed to analyze scenario. Make sure the backend is running.</p>
        )}
      </div>

      {whatIfMutation.isPending && <Loading message="Simulating alternative scenario..." />}

      {/* Results */}
      {result && (
        <>
          {/* Original Outcome */}
          <div className="card">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Original Outcome</p>
            <p className="font-semibold text-slate-800">{result.original_outcome}</p>
          </div>

          {/* Prediction */}
          {result.prediction && (
            <div className="space-y-4">
              {/* Probability */}
              <div className="card-accent">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-c9-blue">Scenario Analysis</h3>
                  <span className={`badge ${
                    result.prediction.confidence === 'high' ? 'badge-green'
                    : result.prediction.confidence === 'medium' ? 'badge-yellow'
                    : 'badge-red'
                  }`}>
                    {result.prediction.confidence} confidence
                  </span>
                </div>

                {/* Probability Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Success Probability</span>
                    <span className="font-bold text-c9-blue">
                      {(result.prediction.success_probability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-c9-blue rounded-full h-3 transition-all duration-500"
                      style={{ width: `${result.prediction.success_probability * 100}%` }}
                    />
                  </div>
                </div>

                <p className="text-sm text-slate-700">{result.prediction.reasoning}</p>
              </div>

              {/* Key Factors */}
              {result.prediction.key_factors?.length > 0 && (
                <div className="card">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Lightbulb size={14} className="text-c9-blue" /> Key Factors
                  </h3>
                  <ul className="space-y-2">
                    {result.prediction.key_factors.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <HelpCircle size={14} className="text-c9-blue mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risks & Rewards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.prediction.rewards?.length > 0 && (
                  <div className="card">
                    <h3 className="text-sm font-semibold text-emerald-600 mb-3 flex items-center gap-2">
                      <CheckCircle size={14} /> Potential Rewards
                    </h3>
                    <ul className="space-y-2">
                      {result.prediction.rewards.map((r: string, i: number) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-emerald-500 mt-1">+</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.prediction.risks?.length > 0 && (
                  <div className="card">
                    <h3 className="text-sm font-semibold text-red-500 mb-3 flex items-center gap-2">
                      <AlertTriangle size={14} /> Potential Risks
                    </h3>
                    <ul className="space-y-2">
                      {result.prediction.risks.map((r: string, i: number) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-red-500 mt-1">-</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {!result && !whatIfMutation.isPending && (
        <div className="text-center py-12 text-slate-400">
          <p>Select a match and describe a scenario to analyze</p>
        </div>
      )}
    </div>
  )
}

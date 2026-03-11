import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getTeamMatches, getMacroReview } from '../../api/insights'
import { useGame } from '../../hooks/useGame'
import Loading from '../../components/Loading'
import { Loader2, Clock, AlertCircle, CheckCircle, Star } from 'lucide-react'

export default function MacroReviewTab() {
  const { game, teamId } = useGame()
  const [selectedMatch, setSelectedMatch] = useState('')
  const [gameNumber, setGameNumber] = useState(1)

  const { data: matches } = useQuery({
    queryKey: ['matches', teamId, game],
    queryFn: () => getTeamMatches(teamId, game),
  })

  const reviewMutation = useMutation({
    mutationFn: () => getMacroReview(selectedMatch, game, gameNumber),
  })

  const matchList = matches?.data?.matches || []
  const review = reviewMutation.data?.data?.agenda

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Macro Review</h2>
        <p className="text-sm text-slate-500">Generate a structured review agenda for a match</p>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="block text-sm font-medium text-slate-600 mb-1">Game Number</label>
            <select value={gameNumber} onChange={(e) => setGameNumber(Number(e.target.value))} className="select w-full">
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>Game {n}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => reviewMutation.mutate()}
              className="btn btn-primary flex items-center gap-2 w-full justify-center"
              disabled={!selectedMatch || reviewMutation.isPending}
            >
              {reviewMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              {reviewMutation.isPending ? 'Generating...' : 'Generate Review'}
            </button>
          </div>
        </div>
        {reviewMutation.isError && (
          <p className="text-red-500 text-sm mt-3">Failed to generate review. Make sure the backend is running.</p>
        )}
      </div>

      {reviewMutation.isPending && <Loading message="Generating review agenda..." />}

      {/* Review Results */}
      {review && (
        <>
          {/* Executive Summary */}
          <div className="card-accent">
            <h3 className="text-sm font-semibold text-c9-blue mb-2">Executive Summary</h3>
            <p className="text-sm text-slate-700">{review.executive_summary}</p>
            <div className="flex gap-4 mt-3 text-xs text-slate-500">
              <span>Outcome: <strong>{review.match_outcome}</strong></span>
              <span className="flex items-center gap-1"><Clock size={12} /> {review.total_duration_minutes} min review</span>
            </div>
          </div>

          {/* Priority Topics */}
          {review.priority_topics?.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Star size={14} className="text-c9-blue" /> Priority Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {review.priority_topics.map((topic: string, i: number) => (
                  <span key={i} className="badge badge-blue">{topic}</span>
                ))}
              </div>
            </div>
          )}

          {/* Key Moments */}
          {review.key_moments?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Key Moments</h3>
              <div className="space-y-3">
                {review.key_moments.map((moment: any, i: number) => (
                  <div key={i} className={`card border-l-4 ${
                    moment.priority === 'critical' ? 'border-l-red-400'
                    : moment.priority === 'important' ? 'border-l-c9-blue'
                    : 'border-l-slate-300'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-800">{moment.title}</p>
                        {moment.timestamp && <p className="text-xs text-slate-400 mt-0.5">{moment.timestamp}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${
                          moment.priority === 'critical' ? 'badge-red'
                          : moment.priority === 'important' ? 'badge-yellow'
                          : 'badge-blue'
                        }`}>{moment.priority}</span>
                        <span className="badge badge-blue">{moment.category}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">{moment.description}</p>
                    {moment.discussion_points?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-slate-500 mb-1">Discussion Points:</p>
                        <ul className="text-sm text-slate-600 space-y-1">
                          {moment.discussion_points.map((dp: string, j: number) => (
                            <li key={j} className="flex items-start gap-2">
                              <CheckCircle size={12} className="text-c9-blue mt-0.5 shrink-0" />
                              {dp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Observations */}
          {review.team_level_observations?.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Team-Level Observations</h3>
              <ul className="space-y-2">
                {review.team_level_observations.map((obs: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <AlertCircle size={14} className="text-c9-blue mt-0.5 shrink-0" />
                    {obs}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {!review && !reviewMutation.isPending && (
        <div className="text-center py-12 text-slate-400">
          <p>Select a match and generate a review agenda</p>
        </div>
      )}
    </div>
  )
}

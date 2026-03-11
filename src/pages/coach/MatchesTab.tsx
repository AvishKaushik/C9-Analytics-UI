import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTeamMatches, getMatchTimeline } from '../../api/insights'
import { useGame } from '../../hooks/useGame'
import Loading from '../../components/Loading'
import { Calendar, Trophy } from 'lucide-react'

export default function MatchesTab() {
  const { game, teamId } = useGame()
  const [selectedMatch, setSelectedMatch] = useState<string>('')

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches', teamId, game],
    queryFn: () => getTeamMatches(teamId, game),
    staleTime: 5 * 60 * 1000,
  })

  const { data: timeline, isLoading: loadingTimeline } = useQuery({
    queryKey: ['timeline', selectedMatch, game],
    queryFn: () => getMatchTimeline(selectedMatch, game),
    enabled: !!selectedMatch,
  })

  if (isLoading) return <Loading message="Loading matches..." />

  const matchList = matches?.data?.matches || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Match History</h2>
        <p className="text-sm text-slate-500">Select a match to view its timeline</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Match List */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Recent Matches</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {matchList.map((match: any) => (
              <button
                key={match.series_id}
                onClick={() => setSelectedMatch(match.series_id)}
                className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 ${
                  selectedMatch === match.series_id
                    ? 'bg-c9-accent border-c9-blue shadow-sm'
                    : 'bg-white border-slate-200 hover:border-c9-blue/30'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-800">vs {match.opponent_name}</p>
                    {match.tournament && <p className="text-xs text-slate-400 mt-0.5">{match.tournament}</p>}
                  </div>
                  <span className={`badge ${match.result === 'Win' ? 'badge-green' : 'badge-red'}`}>
                    {match.result} {match.score}
                  </span>
                </div>
                {match.date && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                    <Calendar size={12} />
                    {new Date(match.date).toLocaleDateString()}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Match Timeline</h3>
          {selectedMatch ? (
            loadingTimeline ? (
              <Loading message="Loading timeline..." />
            ) : timeline?.data ? (
              <div className="space-y-3">
                <div className="card-accent flex justify-between items-center">
                  <span className="text-sm font-medium">Map: {timeline.data.map_name}</span>
                  <span className="font-bold text-slate-800">Final: {timeline.data.final_score}</span>
                  {timeline.data.winner && (
                    <span className="flex items-center gap-1 text-c9-blue text-sm">
                      <Trophy size={14} /> {timeline.data.winner}
                    </span>
                  )}
                </div>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {timeline.data.events?.map((event: any, i: number) => (
                    <div key={i} className="card">
                      <div className="flex justify-between items-start">
                        <span className={`badge ${
                          event.event_type === 'game_start' ? 'badge-blue' :
                          event.event_type === 'game_end' ? 'badge-green' :
                          event.event_type === 'outstanding_performance' ? 'badge-yellow' :
                          'badge-red'
                        }`}>
                          {event.event_type.replace(/_/g, ' ')}
                        </span>
                        {event.team && <span className="text-xs text-slate-400">{event.team}</span>}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          ) : (
            <div className="text-center py-16 text-slate-400">
              <p>Select a match to view timeline</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTeamRoster, getPlayerInsights, getPlayerTrends } from '../../api/insights'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useGame } from '../../hooks/useGame'
import PlayerCard from '../../components/PlayerCard'
import StatCard from '../../components/StatCard'
import { Gamepad2, Trophy, Crosshair, TrendingUp } from 'lucide-react'

export default function PlayersTab() {
  const { game, teamId } = useGame()
  const [selectedPlayer, setSelectedPlayer] = useState<string>('')

  const { data: roster } = useQuery({
    queryKey: ['roster', teamId, game],
    queryFn: () => getTeamRoster(teamId, game),
    staleTime: 5 * 60 * 1000, // Use cached data from preload
  })

  // Use prefetched data (query keys must match useDataLoader)
  const { data: insights } = useQuery({
    queryKey: ['playerInsights', selectedPlayer, game],
    queryFn: () => getPlayerInsights(selectedPlayer, game),
    enabled: !!selectedPlayer,
    staleTime: 5 * 60 * 1000,
  })

  const { data: trends } = useQuery({
    queryKey: ['playerTrends', selectedPlayer, game, 50],
    queryFn: () => getPlayerTrends(selectedPlayer, game, 50),
    enabled: !!selectedPlayer,
    staleTime: 5 * 60 * 1000,
  })


  const players = roster?.data?.players || []
  const data = insights?.data

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Player Analysis</h2>
        <p className="text-sm text-slate-500">Select a player to view detailed insights</p>
      </div>

      {/* Player Selection */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {players.map((player: any) => (
          <PlayerCard
            key={player.player_id}
            playerId={player.player_id}
            name={player.player_name}
            kda={player.avg_kda}
            form={player.recent_form}
            gamesPlayed={player.games_played}
            isSelected={selectedPlayer === player.player_id}
            onClick={() => setSelectedPlayer(player.player_id)}
          />
        ))}
      </div>

      {/* Player Insights */}
      {selectedPlayer && data && (
        <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Games" value={data.stats?.games_played || 0} icon={<Gamepad2 size={20} />} />
                <StatCard label="Win Rate" value={`${((data.stats?.win_rate || 0) * 100).toFixed(0)}%`} icon={<Trophy size={20} />} accent />
                <StatCard label="Avg KDA" value={data.stats?.avg_kda?.toFixed(2) || '0'} icon={<Crosshair size={20} />} />
                <StatCard label="Form" value={data.recent_form?.form_rating || '-'} icon={<TrendingUp size={20} />} />
              </div>

              {/* Agent Pool */}
              {data.agent_pool?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    {game === 'Valorant' ? 'Agent' : 'Champion'} Pool
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {data.agent_pool.slice(0, 4).map((agent: any) => (
                      <div key={agent.agent_id} className="card">
                        <p className="font-semibold text-slate-800">{agent.agent_name}</p>
                        <div className="flex justify-between text-sm text-slate-500 mt-2">
                          <span>{agent.games_played} games</span>
                          <span className="text-c9-blue font-medium">{(agent.win_rate * 100).toFixed(0)}% WR</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">KDA: {agent.avg_kda?.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trends Chart */}
              {(trends?.data?.data_points?.length ?? 0) > 0 && (
                <div className="card">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                    Performance Trend
                    <span className={`ml-2 badge ${
                      trends!.data.trend_direction === 'improving' ? 'badge-green'
                      : trends!.data.trend_direction === 'declining' ? 'badge-red'
                      : 'badge-blue'
                    }`}>
                      {trends!.data.trend_direction}
                    </span>
                  </h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trends!.data.data_points.slice().reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                        />
                        <Line type="monotone" dataKey="kda" stroke="#3eaff0" strokeWidth={2} dot={{ fill: '#3eaff0', r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Patterns & Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Patterns Detected</h3>
                  {data.patterns?.length > 0 ? (
                    <div className="space-y-2">
                      {data.patterns.map((pattern: any, i: number) => (
                        <div key={i} className={`card ${
                          pattern.impact === 'positive' ? 'border-l-4 border-l-emerald-400'
                          : pattern.impact === 'negative' ? 'border-l-4 border-l-red-400'
                          : ''
                        }`}>
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-slate-800 text-sm">{pattern.pattern_type}</p>
                            <span className={`badge ${
                              pattern.impact === 'positive' ? 'badge-green'
                              : pattern.impact === 'negative' ? 'badge-red'
                              : 'badge-blue'
                            }`}>{pattern.impact}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{pattern.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No patterns detected</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Coaching Insights</h3>
                  {data.insights?.length > 0 ? (
                    <div className="space-y-2">
                      {data.insights.map((insight: any, i: number) => (
                        <div key={i} className="card">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-slate-800 text-sm">{insight.title}</p>
                            <span className={`badge ${
                              insight.priority === 'high' ? 'badge-red'
                              : insight.priority === 'medium' ? 'badge-yellow'
                              : 'badge-blue'
                            }`}>{insight.priority}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{insight.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No insights available</p>
                  )}
                </div>
              </div>
        </>
      )}
    </div>
  )
}

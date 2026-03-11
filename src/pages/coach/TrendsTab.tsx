import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTeamRoster, getPlayerTrends } from '../../api/insights'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useGame } from '../../hooks/useGame'
import PlayerCard from '../../components/PlayerCard'
import StatCard from '../../components/StatCard'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function TrendsTab() {
  const { game, teamId } = useGame()
  const [selectedPlayer, setSelectedPlayer] = useState<string>('')

  const { data: roster } = useQuery({
    queryKey: ['roster', teamId, game],
    queryFn: () => getTeamRoster(teamId, game),
    staleTime: 5 * 60 * 1000,
  })

  // Use prefetched trends data (limit=50)
  const { data: trends } = useQuery({
    queryKey: ['playerTrends', selectedPlayer, game, 50],
    queryFn: () => getPlayerTrends(selectedPlayer, game, 50),
    enabled: !!selectedPlayer,
    staleTime: 5 * 60 * 1000,
  })

  const players = roster?.data?.players || []
  const trendData = trends?.data

  const TrendIcon = trendData?.trend_direction === 'improving' ? TrendingUp
    : trendData?.trend_direction === 'declining' ? TrendingDown : Minus

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Performance Trends</h2>
        <p className="text-sm text-slate-500">Track player performance over last 50 matches</p>
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
            isSelected={selectedPlayer === player.player_id}
            onClick={() => setSelectedPlayer(player.player_id)}
          />
        ))}
      </div>

      {trendData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Trend"
              value={trendData.trend_direction || 'stable'}
              icon={<TrendIcon size={20} />}
              accent={trendData.trend_direction === 'improving'}
            />
            <StatCard label="Avg KDA Trend" value={trendData.avg_kda_trend?.toFixed(2) || '-'} />
            <StatCard label="Win Rate Trend" value={`${((trendData.win_rate_trend || 0) * 100).toFixed(0)}%`} />
            <StatCard label="Data Points" value={trendData.data_points?.length || 0} />
          </div>

          {/* Chart */}
          {trendData.data_points?.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                KDA Over Time - {trendData.player_name}
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData.data_points.slice().reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(value: number, name: string) => [value?.toFixed(2), name]}
                    />
                    <Line type="monotone" dataKey="kda" stroke="#3eaff0" strokeWidth={2.5} dot={{ fill: '#3eaff0', r: 3 }} name="KDA" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Match Details */}
          {trendData.data_points?.length > 0 && (
            <div className="card overflow-x-auto">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Match-by-Match</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">{game === 'Valorant' ? 'Agent' : 'Champion'}</th>
                    <th className="pb-2">K</th>
                    <th className="pb-2">D</th>
                    <th className="pb-2">A</th>
                    <th className="pb-2">KDA</th>
                    <th className="pb-2">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {trendData.data_points.slice(0, 10).map((dp: any, i: number) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-2 text-slate-500">{dp.date}</td>
                      <td className="py-2">{dp.agent || '-'}</td>
                      <td className="py-2">{dp.kills}</td>
                      <td className="py-2">{dp.deaths}</td>
                      <td className="py-2">{dp.assists}</td>
                      <td className="py-2 font-semibold">{dp.kda?.toFixed(2)}</td>
                      <td className="py-2">
                        <span className={`badge ${dp.result === 'Win' ? 'badge-green' : 'badge-red'}`}>
                          {dp.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!selectedPlayer && (
        <div className="text-center py-12 text-slate-400">
          <p>Select a player to view performance trends</p>
        </div>
      )}
    </div>
  )
}

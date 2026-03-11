import { useQuery } from '@tanstack/react-query'
import { getTeamInsights } from '../../api/insights'
import { useGame } from '../../hooks/useGame'
import StatCard from '../../components/StatCard'
import Loading from '../../components/Loading'
import { Activity, Trophy, Crosshair, TrendingDown } from 'lucide-react'

export default function TeamTab() {
  const { game, teamId } = useGame()

  const { data, isLoading } = useQuery({
    queryKey: ['teamInsights', teamId, game, 30],
    queryFn: () => getTeamInsights(teamId, game, 30),
    staleTime: 5 * 60 * 1000,
  })

  const team = data?.data

  if (isLoading) {
    return <Loading message="Loading team analysis..." />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Team Analysis</h2>
        <p className="text-sm text-slate-500">Insights from last 30 matches</p>
      </div>

      {team ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Games" value={team.team_stats?.games_played || 0} icon={<Activity size={20} />} />
            <StatCard label="Wins" value={team.team_stats?.wins || 0} icon={<Trophy size={20} />} accent />
            <StatCard label="Losses" value={team.team_stats?.losses || 0} icon={<TrendingDown size={20} />} />
            <StatCard label="Win Rate" value={`${((team.team_stats?.win_rate || 0) * 100).toFixed(0)}%`} icon={<Trophy size={20} />} />
            <StatCard label="Team K/D" value={team.team_stats?.team_kd?.toFixed(2) || '0'} icon={<Crosshair size={20} />} />
          </div>

          {/* Summary */}
          {team.summary && (
            <div className="card-accent">
              <h3 className="text-sm font-semibold text-c9-blue mb-2">Summary</h3>
              <p className="text-sm text-slate-700">{team.summary}</p>
            </div>
          )}

          {/* Roster Table */}
          {team.roster?.length > 0 && (
            <div className="card overflow-x-auto">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Roster Performance</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-2">Player</th>
                    <th className="pb-2">Games</th>
                    <th className="pb-2">KDA</th>
                    <th className="pb-2">Win Rate</th>
                    <th className="pb-2">Main Agents</th>
                    <th className="pb-2">Form</th>
                  </tr>
                </thead>
                <tbody>
                  {team.roster.map((player: any) => (
                    <tr key={player.player_id} className="border-b border-slate-100">
                      <td className="py-3 font-medium text-slate-800">{player.player_name}</td>
                      <td className="py-3">{player.games_played}</td>
                      <td className="py-3 font-semibold">{player.avg_kda?.toFixed(2)}</td>
                      <td className="py-3 text-c9-blue font-medium">{(player.win_rate * 100).toFixed(0)}%</td>
                      <td className="py-3 text-slate-500">{player.main_agents?.join(', ')}</td>
                      <td className="py-3">
                        <span className={`badge ${
                          player.recent_form === 'hot' ? 'badge-green'
                          : player.recent_form === 'cold' ? 'badge-red'
                          : 'badge-blue'
                        }`}>{player.recent_form}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Patterns & Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Team Patterns</h3>
              {team.patterns?.length > 0 ? (
                <div className="space-y-2">
                  {team.patterns.map((p: any, i: number) => (
                    <div key={i} className="card">
                      <p className="font-medium text-sm text-slate-800">{p.pattern_type}</p>
                      <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-slate-400 text-sm">No patterns detected</p>}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Strategic Insights</h3>
              {team.insights?.length > 0 ? (
                <div className="space-y-2">
                  {team.insights.map((ins: any, i: number) => (
                    <div key={i} className="card">
                      <p className="font-medium text-sm text-slate-800">{ins.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{ins.description}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-slate-400 text-sm">No insights available</p>}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <p>No team data available</p>
        </div>
      )}
    </div>
  )
}

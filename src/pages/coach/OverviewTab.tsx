import { useQuery } from '@tanstack/react-query'
import { Activity, Trophy, Crosshair, Users } from 'lucide-react'
import { getTeamRoster } from '../../api/insights'
import { useGame } from '../../hooks/useGame'
import StatCard from '../../components/StatCard'
import PlayerCard from '../../components/PlayerCard'
import Loading from '../../components/Loading'

export default function OverviewTab() {
  const { game, teamId } = useGame()

  const { data: roster, isLoading } = useQuery({
    queryKey: ['roster', teamId, game],
    queryFn: () => getTeamRoster(teamId, game),
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) return <Loading message="Loading Cloud9 data..." />

  const stats = roster?.data?.team_stats
  const players = roster?.data?.players || []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Team Name */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">{roster?.data?.team_name || 'Cloud9'}</h2>
        <p className="text-sm text-slate-500">{game === 'Valorant' ? 'VALORANT' : 'League of Legends'} Overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Games Played" value={stats?.games_played || 0} icon={<Activity size={20} />} />
        <StatCard label="Win Rate" value={`${((stats?.win_rate || 0) * 100).toFixed(0)}%`} icon={<Trophy size={20} />} accent />
        <StatCard label="Team K/D" value={stats?.team_kd?.toFixed(2) || '0.00'} icon={<Crosshair size={20} />} />
        <StatCard label="Roster Size" value={players.length} icon={<Users size={20} />} />
      </div>

      {/* Roster */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Active Roster</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {players.map((player: any) => (
            <PlayerCard
              key={player.player_id}
              playerId={player.player_id}
              name={player.player_name}
              kda={player.avg_kda}
              form={player.recent_form}
              gamesPlayed={player.games_played}
              onClick={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

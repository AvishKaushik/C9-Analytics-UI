import { useQuery } from '@tanstack/react-query'
import { getTeamRoster, comparePlayers } from '../../api/insights'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts'
import { useGame } from '../../hooks/useGame'
import Loading from '../../components/Loading'

// Player colors for the radar chart
const PLAYER_COLORS = [
  '#3eaff0', // C9 Blue
  '#f87171', // Red
  '#a3e635', // Green
  '#fbbf24', // Yellow
  '#a78bfa', // Purple
]

export default function CompareTab() {
  const { game, teamId } = useGame()

  const { data: roster } = useQuery({
    queryKey: ['roster', teamId, game],
    queryFn: () => getTeamRoster(teamId, game),
    staleTime: 5 * 60 * 1000,
  })

  const players = roster?.data?.players || []
  const playerIds = players.map((p: any) => p.player_id)

  const { data: comparison, isLoading } = useQuery({
    queryKey: ['comparison', playerIds, game],
    queryFn: () => comparePlayers(playerIds, game),
    enabled: playerIds.length >= 2,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading || !roster) {
    return <Loading message="Loading comparison..." />
  }

  const comparisonPlayers = comparison?.data?.players || []

  // Prepare radar chart data based on game type
  const getRadarData = () => {
    if (game === 'Valorant') {
      // Valorant metrics - normalize to 0-100 scale
      const metrics = [
        { name: 'KDA', key: 'avg_kda', max: 3 },
        { name: 'Win Rate', key: 'win_rate', max: 1, multiply: 100 },
        { name: 'Avg Kills', key: 'avg_kills', max: 20 },
        { name: 'ADR', key: 'avg_adr', max: 200 },
        { name: 'HS %', key: 'headshot_pct', max: 50 },
        { name: 'Plants', key: 'plants', max: 20 },
      ]

      return metrics.map(metric => {
        const dataPoint: any = { metric: metric.name }
        comparisonPlayers.forEach((p: any) => {
          let value = p[metric.key] || 0
          if (metric.multiply) value *= metric.multiply
          // Normalize to 0-100 scale
          dataPoint[p.player_name] = Math.min(100, (value / metric.max) * 100)
        })
        return dataPoint
      })
    } else {
      // LoL metrics
      const metrics = [
        { name: 'KDA', key: 'avg_kda', max: 5 },
        { name: 'Win Rate', key: 'win_rate', max: 1, multiply: 100 },
        { name: 'CS/min', key: 'cs_per_min', max: 10 },
        { name: 'Gold/min', key: 'gold_per_min', max: 500 },
        { name: 'DMG/min', key: 'damage_per_min', max: 1000 },
        { name: 'Vision', key: 'vision_score', max: 50 },
      ]

      return metrics.map(metric => {
        const dataPoint: any = { metric: metric.name }
        comparisonPlayers.forEach((p: any) => {
          let value = p[metric.key] || 0
          if (metric.multiply) value *= metric.multiply
          dataPoint[p.player_name] = Math.min(100, (value / metric.max) * 100)
        })
        return dataPoint
      })
    }
  }

  const radarData = getRadarData()
  const playerNames = comparisonPlayers.map((p: any) => p.player_name)

  // Get table columns based on game type
  const getTableHeaders = () => {
    const baseHeaders = ['Player', 'Games', 'Win Rate', 'K', 'D', 'A', 'KDA', 'Form']
    if (game === 'Valorant') {
      return [...baseHeaders, 'ADR', 'DMG/G', 'HS%', 'Plants', 'Defuses']
    } else {
      return [...baseHeaders, 'CS/m', 'Gold/m', 'DMG/m', 'Vision', 'KP%', 'DMG%', 'Gold%']
    }
  }

  const renderPlayerRow = (p: any) => {
    const baseRow = (
      <>
        <td className="py-3 font-medium text-slate-800">{p.player_name}</td>
        <td className="py-3 text-center">{p.games_played}</td>
        <td className="py-3 text-center text-c9-blue font-medium">{(p.win_rate * 100).toFixed(0)}%</td>
        <td className="py-3 text-center">{p.avg_kills?.toFixed(1)}</td>
        <td className="py-3 text-center">{p.avg_deaths?.toFixed(1)}</td>
        <td className="py-3 text-center">{p.avg_assists?.toFixed(1)}</td>
        <td className="py-3 text-center font-bold">{p.avg_kda?.toFixed(2)}</td>
        <td className="py-3 text-center">
          <span className={`badge ${p.recent_form === 'hot' ? 'badge-green'
            : p.recent_form === 'cold' ? 'badge-red'
              : 'badge-blue'
            }`}>{p.recent_form}</span>
        </td>
      </>
    )

    if (game === 'Valorant') {
      return (
        <>
          {baseRow}
          <td className="py-3 text-center text-orange-600">{p.avg_adr?.toFixed(0) ?? '-'}</td>
          <td className="py-3 text-center">{p.avg_acs?.toFixed(0) ?? '-'}</td>
          <td className="py-3 text-center font-medium">{p.headshot_pct?.toFixed(1) ?? '-'}%</td>
          <td className="py-3 text-center text-emerald-600">{p.plants ?? '-'}</td>
          <td className="py-3 text-center text-blue-600">{p.defuses ?? '-'}</td>
        </>
      )
    } else {
      return (
        <>
          {baseRow}
          <td className="py-3 text-center">{p.cs_per_min?.toFixed(1) ?? '-'}</td>
          <td className="py-3 text-center">{p.gold_per_min?.toFixed(0) ?? '-'}</td>
          <td className="py-3 text-center">{p.damage_per_min?.toFixed(0) ?? '-'}</td>
          <td className="py-3 text-center">{p.vision_score?.toFixed(1) ?? '-'}</td>
          <td className="py-3 text-center">{p.kill_participation?.toFixed(1) ?? '-'}%</td>
          <td className="py-3 text-center">{p.damage_share?.toFixed(1) ?? '-'}%</td>
          <td className="py-3 text-center">{p.gold_share?.toFixed(1) ?? '-'}%</td>
        </>
      )
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Player Comparison</h2>
        <p className="text-sm text-slate-500">Comparing all {players.length} roster players</p>
      </div>

      {comparison?.data ? (
        <>
          {/* Highlights */}
          {comparison.data.comparison_highlights?.length > 0 && (
            <div className="card-accent">
              <h3 className="text-sm font-semibold text-c9-blue mb-2">Highlights</h3>
              <ul className="space-y-1">
                {comparison.data.comparison_highlights.map((h: string, i: number) => (
                  <li key={i} className="text-sm text-slate-700">{h}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Radar Chart */}
          {radarData.length > 0 && playerNames.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                Performance Radar
              </h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    {playerNames.map((name: string, idx: number) => (
                      <Radar
                        key={name}
                        name={name}
                        dataKey={name}
                        stroke={PLAYER_COLORS[idx % PLAYER_COLORS.length]}
                        fill={PLAYER_COLORS[idx % PLAYER_COLORS.length]}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-slate-400 text-center mt-2">
                Values normalized to 0-100% scale for comparison
              </p>
            </div>
          )}

          {/* Stats Table */}
          <div className="card overflow-x-auto">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Detailed Statistics
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {getTableHeaders().map((header, idx) => (
                    <th key={idx} className="pb-2 px-2 text-left first:text-left text-center whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonPlayers.map((p: any) => (
                  <tr key={p.player_id} className="border-b border-slate-100">
                    {renderPlayerRow(p)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Agent/Champion Pool */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              {game === 'Valorant' ? 'Agent' : 'Champion'} Pools
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparisonPlayers.map((p: any, idx: number) => (
                <div
                  key={p.player_id}
                  className="p-3 rounded-lg border-l-4"
                  style={{ borderLeftColor: PLAYER_COLORS[idx % PLAYER_COLORS.length] }}
                >
                  <p className="font-medium text-slate-800 mb-2">{p.player_name}</p>
                  <div className="flex flex-wrap gap-1">
                    {p.main_agents?.map((agent: string, i: number) => (
                      <span key={i} className="badge badge-blue text-xs">{agent}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <p>No comparison data available</p>
        </div>
      )}
    </div>
  )
}

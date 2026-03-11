import { useQuery } from '@tanstack/react-query'
import { Crown, TrendingUp, Percent } from 'lucide-react'
import { draftApi } from '../../api/draft'
import Loading from '../../components/Loading'

export default function MetaChampionsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['metaChampions'],
    queryFn: () => draftApi.getMetaChampions(),
  })

  const flexQuery = useQuery({
    queryKey: ['flexPicks'],
    queryFn: () => draftApi.getFlexPicks(),
  })

  if (isLoading) {
    return <Loading message="Loading meta champions..." />
  }

  const champions = data?.champions || []
  const flexPicks = flexQuery.data?.flex_picks || []

  // Group by tier
  const tiers: Record<string, any[]> = { S: [], A: [], B: [], C: [] }
  champions.forEach((c: any) => {
    const tier = c.tier || 'B'
    if (tiers[tier]) {
      tiers[tier].push(c)
    }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tier Lists */}
      {Object.entries(tiers).map(([tier, champs]) => (
        champs.length > 0 && (
          <div key={tier} className="card">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-2xl font-bold ${
                tier === 'S' ? 'text-amber-500' :
                tier === 'A' ? 'text-emerald-500' :
                tier === 'B' ? 'text-blue-500' : 'text-slate-400'
              }`}>
                {tier}
              </span>
              <span className="text-slate-500">Tier</span>
              {tier === 'S' && <Crown size={16} className="text-amber-500" />}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {champs.map((champ: any) => (
                <div key={champ.name} className="border border-slate-200 rounded-lg p-3 hover:border-c9-blue transition-colors">
                  <p className="font-semibold text-slate-800 mb-1">{champ.name}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {champ.roles?.map((role: string) => (
                      <span key={role} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {role}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {champ.win_rate && (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <Percent size={10} />
                        {(champ.win_rate * 100).toFixed(0)}% WR
                      </span>
                    )}
                    {champ.pick_rate && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <TrendingUp size={10} />
                        {(champ.pick_rate * 100).toFixed(0)}% PR
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {/* Flex Picks */}
      {flexPicks.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Flex Picks</h3>
          <p className="text-sm text-slate-500 mb-4">
            Champions that can be played in multiple roles, providing draft flexibility.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {flexPicks.map((champ: any) => (
              <div key={champ.name} className="border border-slate-200 rounded-lg p-3">
                <p className="font-semibold text-slate-800 mb-1">{champ.name}</p>
                <div className="flex flex-wrap gap-1">
                  {champ.roles?.map((role: string) => (
                    <span key={role} className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

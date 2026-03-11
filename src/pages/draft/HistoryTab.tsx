import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { History, ChevronDown, ChevronUp } from 'lucide-react'
import { draftApi } from '../../api/draft'
import DraftTeamSearch from '../../components/DraftTeamSearch'
import Loading from '../../components/Loading'

export default function HistoryTab() {
  const [selectedTeam, setSelectedTeam] = useState<{ id: string; name: string } | null>(null)
  const [expandedDraft, setExpandedDraft] = useState<number | null>(null)

  const historyMutation = useMutation({
    mutationFn: () => draftApi.getDraftHistory(selectedTeam!.id, 20),
  })

  const handleGetHistory = () => {
    if (selectedTeam) {
      historyMutation.mutate()
    }
  }

  const history = historyMutation.data?.drafts || []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search */}
      <div className="card overflow-visible">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Draft History</h2>
        <p className="text-sm text-slate-500 mb-4">
          View a team's recent draft patterns and priority picks/bans.
        </p>

        <div className="mb-4">
          <label className="text-sm text-slate-600 mb-2 block">Select Team</label>
          <DraftTeamSearch
            selectedTeam={selectedTeam}
            onSelectTeam={setSelectedTeam}
            placeholder="Search LoL team..."
          />
        </div>

        {selectedTeam && (
          <div className="bg-c9-accent rounded-lg p-3 mb-4">
            <span className="font-semibold text-c9-blue">{selectedTeam.name}</span>
          </div>
        )}

        <button
          onClick={handleGetHistory}
          disabled={!selectedTeam || historyMutation.isPending}
          className="btn btn-primary"
        >
          <History size={16} className="mr-2" />
          Get Draft History
        </button>
      </div>

      {/* Loading */}
      {historyMutation.isPending && <Loading message="Loading draft history..." />}

      {/* Priority Analysis */}
      {historyMutation.data?.priority_picks && (
        <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-3">Priority Picks</h3>
            <div className="space-y-2">
              {historyMutation.data.priority_picks.slice(0, 5).map((pick: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                  <span className="font-medium text-slate-700">{pick.champion}</span>
                  <span className="text-sm text-slate-500">{pick.count} times</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-3">Priority Bans</h3>
            <div className="space-y-2">
              {historyMutation.data.priority_bans?.slice(0, 5).map((ban: any, i: number) => (
                <div key={i} className="flex items-center justify-between bg-red-50 p-2 rounded">
                  <span className="font-medium text-red-700">{ban.champion}</span>
                  <span className="text-sm text-slate-500">{ban.count} times</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Draft List */}
      {history.length > 0 && (
        <div className="card animate-fade-in">
          <h3 className="font-semibold text-slate-800 mb-4">Recent Drafts</h3>
          <div className="space-y-2">
            {history.map((draft: any, i: number) => (
              <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedDraft(expandedDraft === i ? null : i)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-800">
                      vs {draft.opponent_name || 'Unknown'}
                    </span>
                    <span className="text-sm text-slate-500">
                      {draft.date ? new Date(draft.date).toLocaleDateString() : ''}
                    </span>
                  </div>
                  {expandedDraft === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {expandedDraft === i && (
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Our Team */}
                      <div>
                        <p className="text-xs font-semibold text-c9-blue mb-2">Our Team</p>

                        <div className="mb-2">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Picks</p>
                          <div className="flex flex-wrap gap-1">
                            {draft.our_picks?.map((p: string, j: number) => (
                              <span key={j} className="badge badge-blue">{p}</span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Bans</p>
                          <div className="flex flex-wrap gap-1">
                            {draft.our_bans?.length ? (
                              draft.our_bans.map((b: string, j: number) => (
                                <span key={j} className="badge badge-red">{b}</span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 italic">None recorded</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Enemy Team */}
                      <div>
                        <p className="text-xs font-semibold text-red-600 mb-2">Enemy Team</p>

                        <div className="mb-2">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Picks</p>
                          <div className="flex flex-wrap gap-1">
                            {draft.enemy_picks?.map((p: string, j: number) => (
                              <span key={j} className="badge badge-gray">{p}</span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Bans</p>
                          <div className="flex flex-wrap gap-1">
                            {draft.enemy_bans?.length ? (
                              draft.enemy_bans.map((b: string, j: number) => (
                                <span key={j} className="badge badge-gray">{b}</span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 italic">None recorded</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

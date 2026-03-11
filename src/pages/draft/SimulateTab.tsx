import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { draftApi } from '../../api/draft'
import DraftTeamSearch from '../../components/DraftTeamSearch'
import Loading from '../../components/Loading'

export default function SimulateTab() {
  const [selectedOpponent, setSelectedOpponent] = useState<{ id: string; name: string } | null>(null)
  const [ourSide, setOurSide] = useState<'blue' | 'red'>('blue')

  const simulateMutation = useMutation({
    mutationFn: () => draftApi.simulateDraft('125560', selectedOpponent!.id, ourSide),
  })

  const handleSimulate = () => {
    if (selectedOpponent) {
      simulateMutation.mutate()
    }
  }

  const simulation = simulateMutation.data
  const finalState = simulation?.final_state
  const winProb = simulation?.win_probability

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Setup */}
      <div className="card overflow-visible">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Draft Simulation</h2>
        <p className="text-sm text-slate-500 mb-4">
          Simulate a complete draft against an opponent with AI making picks/bans.
        </p>

        {/* Side Selection */}
        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-2">Our Side</p>
          <div className="flex gap-3">
            <button
              onClick={() => setOurSide('blue')}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${ourSide === 'blue'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-slate-200 hover:border-slate-300'
                }`}
            >
              Blue Side
            </button>
            <button
              onClick={() => setOurSide('red')}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${ourSide === 'red'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-slate-200 hover:border-slate-300'
                }`}
            >
              Red Side
            </button>
          </div>
        </div>

        {/* Opponent Search */}
        <div className="mb-4">
          <label className="text-sm text-slate-600 mb-2 block">Select Opponent</label>
          <DraftTeamSearch
            selectedTeam={selectedOpponent}
            onSelectTeam={setSelectedOpponent}
            placeholder="Search LoL team..."
          />
        </div>

        {selectedOpponent && (
          <div className="bg-red-50 rounded-lg p-3 mb-4">
            <span className="text-sm text-slate-600">vs </span>
            <span className="font-semibold text-red-700">{selectedOpponent.name}</span>
          </div>
        )}

        <button
          onClick={handleSimulate}
          disabled={!selectedOpponent || simulateMutation.isPending}
          className="btn btn-primary"
        >
          <Sparkles size={16} className="mr-2" />
          Run Simulation
        </button>
      </div>

      {/* Loading */}
      {simulateMutation.isPending && <Loading message="Simulating draft..." />}

      {/* Simulation Results */}
      {finalState && (
        <div className="space-y-6 animate-fade-in">
          {/* Teams */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Blue Side */}
            <div className="card">
              <h3 className="font-semibold text-blue-700 mb-3">Blue Side</h3>
              <div className="mb-3">
                <p className="text-xs text-slate-500 mb-1">Bans</p>
                <div className="flex flex-wrap gap-1">
                  {finalState.blue_bans?.map((b: any, i: number) => (
                    <span key={i} className="badge badge-red">{b.champion?.name || b.champion || '?'}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Picks</p>
                <div className="flex flex-wrap gap-1">
                  {finalState.blue_picks?.map((p: any, i: number) => (
                    <span key={i} className="badge badge-blue">{p.champion?.name || p.champion || '?'}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Red Side */}
            <div className="card">
              <h3 className="font-semibold text-red-700 mb-3">Red Side</h3>
              <div className="mb-3">
                <p className="text-xs text-slate-500 mb-1">Bans</p>
                <div className="flex flex-wrap gap-1">
                  {finalState.red_bans?.map((b: any, i: number) => (
                    <span key={i} className="badge badge-red">{b.champion?.name || b.champion || '?'}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Picks</p>
                <div className="flex flex-wrap gap-1">
                  {finalState.red_picks?.map((p: any, i: number) => (
                    <span key={i} className="badge badge-blue">{p.champion?.name || p.champion || '?'}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Win Probability */}
          {winProb !== undefined && (
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-2">Predicted Win Probability</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-200 rounded-full h-4">
                  <div
                    className={`rounded-full h-4 transition-all ${winProb.probability >= 0.5 ? 'bg-c9-blue' : 'bg-red-500'
                      }`}
                    style={{ width: `${winProb.probability * 100}%` }}
                  />
                </div>
                <span className={`font-bold text-lg ${winProb.probability >= 0.5 ? 'text-c9-blue' : 'text-red-500'
                  }`}>
                  {(winProb.probability * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}

          {/* Analysis */}
          {(simulation?.win_condition || simulation?.warnings?.length > 0) && (
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-3">Analysis</h3>
              <p className="text-slate-600 leading-relaxed mb-2">
                <span className="font-semibold">Win Condition:</span> {simulation?.win_condition}
              </p>
              {simulation?.warnings?.map((w: string, i: number) => (
                <p key={i} className="text-amber-600 text-sm flex items-center gap-2">
                  <span>⚠️</span> {w}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

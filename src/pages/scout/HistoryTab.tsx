import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Trash2, Eye, RefreshCw } from 'lucide-react'
import { scoutingApi } from '../../api/scouting'
import Loading from '../../components/Loading'

export default function HistoryTab() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['reportHistory'],
    queryFn: () => scoutingApi.getReportHistory(20),
  })

  const deleteMutation = useMutation({
    mutationFn: (reportId: string) => scoutingApi.deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportHistory'] })
    },
  })

  const reports = data?.reports || []

  if (isLoading) {
    return <Loading message="Loading report history..." />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Report History</h2>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['reportHistory'] })}
            className="btn btn-secondary"
          >
            <RefreshCw size={14} className="mr-1" />
            Refresh
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No reports generated yet.</p>
            <p className="text-sm text-slate-400">Generate a new scouting report to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 text-left">Opponent</th>
                  <th className="py-3 text-left">Game</th>
                  <th className="py-3 text-left">Date</th>
                  <th className="py-3 text-left">Matches</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report: any) => (
                  <tr key={report.report_id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3">
                      <span className="font-medium text-slate-800">{report.opponent_team_name}</span>
                    </td>
                    <td className="py-3">
                      <span className="badge badge-blue">{report.game}</span>
                    </td>
                    <td className="py-3 text-slate-600">
                      {new Date(report.generated_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-slate-600">
                      {report.matches_analyzed || '-'}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                          <Eye size={16} className="text-slate-500" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(report.report_id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorMessageProps {
  message?: string
  onRetry?: () => void
}

export default function ErrorMessage({ message = 'Something went wrong', onRetry }: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <AlertCircle className="text-red-400 mx-auto mb-3" size={28} />
        <p className="text-slate-600 mb-4">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-secondary flex items-center gap-2 mx-auto">
            <RefreshCw size={14} /> Retry
          </button>
        )}
      </div>
    </div>
  )
}

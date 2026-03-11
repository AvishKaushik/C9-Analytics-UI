import { Loader2 } from 'lucide-react'

interface LoadingProps {
  message?: string
}

export default function Loading({ message = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <Loader2 className="animate-spin text-c9-blue mx-auto mb-3" size={28} />
        <p className="text-slate-400 text-sm">{message}</p>
      </div>
    </div>
  )
}

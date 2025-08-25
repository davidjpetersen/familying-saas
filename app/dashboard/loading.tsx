import { Loader2, BarChart3 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  )
}

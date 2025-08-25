import { Loader2, LogIn } from 'lucide-react'

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <LogIn className="h-6 w-6 text-primary" />
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <p className="text-muted-foreground">Setting up authentication...</p>
      </div>
    </div>
  )
}

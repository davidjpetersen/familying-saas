'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, LogIn, Home } from 'lucide-react'

interface AuthErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AuthError({ error, reset }: AuthErrorProps) {
  useEffect(() => {
    // Log auth-specific errors
    console.error('Authentication error:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      context: 'auth',
      timestamp: new Date().toISOString(),
      url: window.location.href
    })

    // Track auth errors for security monitoring
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <LogIn className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Authentication Error
            </h1>
            <p className="text-muted-foreground">
              We're having trouble with the sign-in process. Please try again.
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 text-left">
              <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
                Auth Error Details:
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/sign-in'}
              className="flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

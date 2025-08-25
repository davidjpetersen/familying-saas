'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Settings, Home } from 'lucide-react'

interface ServicesErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ServicesError({ error, reset }: ServicesErrorProps) {
  useEffect(() => {
    // Log service-specific errors
    console.error('Services error:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      context: 'services',
      timestamp: new Date().toISOString(),
      url: window.location.href
    })

    // Track service errors for feature reliability monitoring
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <Settings className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Service Error
            </h1>
            <p className="text-muted-foreground">
              We're having trouble loading this service. Please try again in a moment.
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 text-left">
              <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
                Service Error Details:
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
              onClick={() => window.location.href = '/services'}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              All Services
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

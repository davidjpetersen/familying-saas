'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Shield, Home } from 'lucide-react'

interface AdminErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    // Log admin-specific errors with additional context
    console.error('Admin panel error:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      context: 'admin',
      timestamp: new Date().toISOString(),
      url: window.location.href
    })

    // Add admin-specific error monitoring
    // Example: track admin errors separately for higher priority
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Admin Panel Error
            </h1>
            <p className="text-muted-foreground">
              An error occurred in the admin panel. Our team has been notified.
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 text-left">
              <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
                Admin Error Details:
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
              onClick={() => window.location.href = '/admin'}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Admin Home
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Main Site
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

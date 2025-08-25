/**
 * Error Testing Page - FOR DEVELOPMENT ONLY
 * This page helps verify that all error boundaries are working correctly
 * Remove this from production builds
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AlertTriangle, Bug, Zap, Database, Network } from 'lucide-react'

// Component that throws an error when clicked
function ErrorThrower({ type }: { type: string }) {
  const [shouldError, setShouldError] = useState(false)

  if (shouldError) {
    switch (type) {
      case 'render':
        throw new Error('Test render error: This is a simulated component error')
      case 'async':
        setTimeout(() => {
          throw new Error('Test async error: This is a simulated async error')
        }, 100)
        return <div>Async error triggered...</div>
      case 'network':
        throw new Error('Test network error: Failed to fetch data from API')
      case 'database':
        throw new Error('Test database error: Connection to database failed')
      default:
        throw new Error('Test generic error: Something went wrong')
    }
  }

  return (
    <Button 
      onClick={() => setShouldError(true)}
      variant="destructive"
      className="w-full"
    >
      Trigger {type} Error
    </Button>
  )
}

// Component to test error boundary isolation
function IsolatedErrorTest() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-5 h-5" />
          Isolated Error Test
        </CardTitle>
        <CardDescription>
          This error should be caught by the local error boundary
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ErrorBoundary>
          <ErrorThrower type="render" />
        </ErrorBoundary>
      </CardContent>
    </Card>
  )
}

export default function ErrorTestPage() {
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Page Not Available</h1>
          <p className="text-muted-foreground">This page is only available in development mode.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">Error Boundary Testing</h1>
        </div>
        <p className="text-muted-foreground">
          Test various error scenarios to verify error boundaries are working correctly
        </p>
        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ This page is for development testing only and will not be available in production
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IsolatedErrorTest />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Async Error Test
            </CardTitle>
            <CardDescription>
              Test async error handling (check browser console)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorThrower type="async" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Network Error Test
            </CardTitle>
            <CardDescription>
              Simulate network/API error
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorThrower type="network" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Error Test
            </CardTitle>
            <CardDescription>
              Simulate database connection error
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorThrower type="database" />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">API Error Testing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Test API Errors</CardTitle>
              <CardDescription>
                Test different API error responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => fetch('/api/test-error/401')}
                className="w-full"
              >
                Test 401 Unauthorized
              </Button>
              <Button 
                variant="outline" 
                onClick={() => fetch('/api/test-error/403')}
                className="w-full"
              >
                Test 403 Forbidden
              </Button>
              <Button 
                variant="outline" 
                onClick={() => fetch('/api/test-error/404')}
                className="w-full"
              >
                Test 404 Not Found
              </Button>
              <Button 
                variant="outline" 
                onClick={() => fetch('/api/test-error/500')}
                className="w-full"
              >
                Test 500 Internal Error
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Route Errors</CardTitle>
              <CardDescription>
                Test route-level error boundaries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/admin/test-error'}
                className="w-full"
              >
                Test Admin Error
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/services/test-error'}
                className="w-full"
              >
                Test Services Error
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/dashboard/test-error'}
                className="w-full"
              >
                Test Dashboard Error
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/nonexistent-page'}
                className="w-full"
              >
                Test 404 Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

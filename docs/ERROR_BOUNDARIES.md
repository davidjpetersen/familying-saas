# Error Boundaries Implementation Guide

This document outlines the comprehensive error boundary system implemented across the Familying SaaS application.

## 🎯 Overview

Error boundaries provide graceful error handling at different levels of the application, ensuring users never see white screens of death and all errors are properly logged for monitoring.

## 📁 File Structure

```text
app/
├── error.tsx                     # Root-level error boundary
├── loading.tsx                   # Root-level loading state
├── not-found.tsx                 # Root-level 404 handler
├── (auth)/
│   ├── error.tsx                 # Auth-specific error boundary
│   └── loading.tsx               # Auth loading state
├── admin/
│   ├── error.tsx                 # Admin-specific error boundary
│   └── loading.tsx               # Admin loading state
├── dashboard/
│   ├── error.tsx                 # Dashboard-specific error boundary
│   └── loading.tsx               # Dashboard loading state
├── services/
│   ├── error.tsx                 # Services-specific error boundary
│   └── loading.tsx               # Services loading state
└── test-errors/                  # Development testing (remove in prod)
    └── page.tsx

components/
└── ErrorBoundary.tsx            # Reusable client-side error boundary

lib/errors/
├── api.ts                       # API error handling utilities
└── api-example.ts               # Migration guide for existing routes

app/api/test-error/              # Development API testing (remove in prod)
└── [type]/route.ts
```

## 🛡️ Error Boundary Hierarchy

### 1. Server-Side Error Boundaries (Route Level)

Next.js automatically catches server-side errors in these files:

- **`app/error.tsx`** - Catches all application errors
- **`app/admin/error.tsx`** - Catches admin panel errors  
- **`app/services/error.tsx`** - Catches service-related errors
- **`app/dashboard/error.tsx`** - Catches dashboard errors
- **`app/(auth)/error.tsx`** - Catches authentication errors

### 2. Client-Side Error Boundaries

- **`components/ErrorBoundary.tsx`** - Reusable React error boundary for components
- **Root Layout Integration** - Wraps the entire app in `app/layout.tsx`

### 3. API Error Handling

- **`lib/errors/api.ts`** - Centralized API error classes and handlers
- **`withErrorHandling`** - Higher-order function for API routes

## 🚀 Usage Examples

### Server Components

Server-side errors are automatically caught by the nearest `error.tsx` file:

```tsx
// app/some-page/page.tsx
export default async function Page() {
  // Any error thrown here will be caught by error.tsx
  const data = await fetchDataThatMightFail()
  return <div>{data}</div>
}
```

### Client Components

Wrap components that might error in the ErrorBoundary:

```tsx
// components/SomeComponent.tsx
'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'

export function SomeComponent() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Custom error handling
        console.log('Component error:', error)
      }}
    >
      <RiskyComponent />
    </ErrorBoundary>
  )
}

// Or use the HOC pattern
const SafeComponent = withErrorBoundary(RiskyComponent)
```

### API Routes

Use the error handling utilities for consistent API responses:

```tsx
// app/api/some-endpoint/route.ts
import { withErrorHandling, throwError } from '@/lib/errors/api'

export const GET = withErrorHandling(async (request) => {
  const { userId } = await auth()
  
  if (!userId) {
    throwError.authentication() // 401 with standard format
  }
  
  const data = await fetchUserData(userId)
  
  if (!data) {
    throwError.notFound('User data not found') // 404 with standard format
  }
  
  return NextResponse.json(data)
})
```

## 🎨 Error UI Components

### Features

- **Consistent Design** - All error boundaries use the same design system
- **Context-Aware** - Different icons and messages based on the section
- **Development Mode** - Shows detailed error info in development
- **User Actions** - Provides "Try Again", "Go Home", and section-specific actions
- **Responsive** - Works on all screen sizes

### Customization

Each error boundary can be customized by modifying its respective `error.tsx` file:

```tsx
// app/admin/error.tsx
export default function AdminError({ error, reset }: ErrorProps) {
  // Custom admin error handling
  // Custom UI for admin context
  // Custom logging for admin errors
}
```

## 📊 Error Monitoring & Logging

### Current Implementation

All errors are logged to the console with structured data:

```typescript
console.error('Error context:', {
  message: error.message,
  stack: error.stack,
  digest: error.digest,
  context: 'admin', // or 'services', 'dashboard', etc.
  timestamp: new Date().toISOString(),
  url: window.location.href
})
```

### Integration Points for Monitoring Services

To integrate with services like Sentry, LogRocket, or DataDog:

```typescript
// In each error boundary
useEffect(() => {
  // Sentry example
  Sentry.captureException(error, {
    contexts: {
      section: 'admin',
      user: { id: userId }
    }
  })
  
  // LogRocket example
  LogRocket.captureException(error)
  
  // Custom analytics
  analytics.track('Error Occurred', {
    error: error.message,
    section: 'admin'
  })
}, [error])
```

## 🔧 API Error Handling

### Error Classes

- **`ValidationError`** - 400 Bad Request
- **`AuthenticationError`** - 401 Unauthorized  
- **`AuthorizationError`** - 403 Forbidden
- **`NotFoundError`** - 404 Not Found
- **`ConflictError`** - 409 Conflict
- **`RateLimitError`** - 429 Too Many Requests
- **`InternalServerError`** - 500 Internal Server Error

### Standard Response Format

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": { "field": "validation details" },
  "timestamp": "2025-08-24T12:00:00.000Z",
  "path": "/api/endpoint",
  "requestId": "optional-request-id"
}
```

### Migration Guide

To update existing API routes:

1. **Import utilities:**

   ```typescript
   import { withErrorHandling, throwError } from '@/lib/errors/api'
   ```

2. **Wrap handlers:**

   ```typescript
   export const GET = withErrorHandling(async (request) => {
     // your logic
   })
   ```

3. **Replace error handling:**

   ```typescript
   // Before
   if (!userId) return new NextResponse('Unauthorized', { status: 401 })
   
   // After  
   if (!userId) throwError.authentication()
   ```

4. **Remove try/catch blocks** (handled by `withErrorHandling`)

## 🧪 Testing

### Development Testing

Visit `/test-errors` in development to test all error scenarios:

- Component error boundaries
- API error responses  
- Route-level error boundaries
- Async error handling

### API Testing

Use `/api/test-error/[type]` endpoints:

- `/api/test-error/401` - Authentication error
- `/api/test-error/403` - Authorization error
- `/api/test-error/404` - Not found error
- `/api/test-error/500` - Internal server error

### Production Safety

Test pages are automatically disabled in production:

```typescript
if (process.env.NODE_ENV === 'production') {
  return <div>Page not available in production</div>
}
```

## 📱 Loading States

Each route section has appropriate loading components:

- **Global** - `app/loading.tsx` - Generic loading spinner
- **Admin** - `app/admin/loading.tsx` - Admin-themed loading
- **Services** - `app/services/loading.tsx` - Services-themed loading  
- **Dashboard** - `app/dashboard/loading.tsx` - Dashboard-themed loading
- **Auth** - `app/(auth)/loading.tsx` - Auth-themed loading

## 🎯 Best Practices

### 1. Error Boundary Placement

- **Route Level**: Use Next.js `error.tsx` files for route-specific errors
- **Component Level**: Use `<ErrorBoundary>` for risky components
- **Global Level**: Root layout includes app-wide error boundary

### 2. Error Logging

- **Structured Logging**: Always include context, timestamp, and user info
- **Error Codes**: Use consistent error codes for easier tracking
- **Development vs Production**: Show detailed errors only in development

### 3. User Experience

- **Graceful Degradation**: Always provide fallback UI
- **Clear Actions**: Give users clear next steps (retry, go home, etc.)
- **Context Awareness**: Tailor error messages to the current section

### 4. Performance

- **Lazy Loading**: Error boundaries don't impact initial bundle size
- **Minimal Dependencies**: Only include necessary libraries
- **Fast Recovery**: Quick "Try Again" functionality

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Remove `/test-errors` route
- [ ] Remove `/api/test-error` routes  
- [ ] Set up error monitoring service (Sentry, etc.)
- [ ] Configure proper logging infrastructure
- [ ] Test error boundaries in staging environment
- [ ] Verify error emails/alerts are working
- [ ] Test mobile error UI responsiveness

## 🔮 Future Enhancements

1. **Error Analytics Dashboard** - Track error frequency and types
2. **User Feedback** - Allow users to report additional context
3. **Smart Recovery** - Automatic retries for transient errors
4. **Offline Support** - Special handling for network errors
5. **Error Boundaries for Suspense** - Integration with React 18 features

## 📞 Support

For questions about error boundary implementation:

1. Check the examples in `lib/errors/api-example.ts`
2. Test with the development tools in `/test-errors`
3. Review the migration guide for updating existing routes
4. Follow the patterns established in existing error boundaries

## 🏆 Success Metrics

With this implementation, you should achieve:

- **Zero White Screens** - All errors have graceful fallbacks
- **Consistent UX** - Uniform error handling across the app
- **Better Debugging** - Structured error logs with context
- **User Retention** - Users can recover from errors easily
- **Monitoring Ready** - Easy integration with error tracking services

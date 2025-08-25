import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, message, 'VALIDATION_ERROR', details)
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(401, message, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Access denied') {
    super(403, message, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message, 'NOT_FOUND_ERROR')
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: any) {
    super(409, message, 'CONFLICT_ERROR', details)
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'Rate limit exceeded') {
    super(429, message, 'RATE_LIMIT_ERROR')
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(500, message, 'INTERNAL_SERVER_ERROR')
  }
}

export interface ApiErrorResponse {
  error: string
  code?: string
  details?: any
  timestamp: string
  path?: string
  requestId?: string
}

export function handleApiError(
  error: unknown,
  request?: Request
): NextResponse<ApiErrorResponse> {
  const timestamp = new Date().toISOString()
  const path = request?.url ? new URL(request.url).pathname : undefined

  // Log error for monitoring
  console.error('API Error:', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    path,
    timestamp,
    method: request?.method
  })

  if (error instanceof ApiError) {
    const response: ApiErrorResponse = {
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp,
      path
    }

    return NextResponse.json(response, { 
      status: error.statusCode,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  // Handle unexpected errors
  const response: ApiErrorResponse = {
    error: process.env.NODE_ENV === 'development' 
      ? (error instanceof Error ? error.message : String(error))
      : 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    timestamp,
    path
  }

  return NextResponse.json(response, { 
    status: 500,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// Wrapper for API route handlers with error handling
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args)
    } catch (error) {
      const request = args[0] as Request
      return handleApiError(error, request)
    }
  }
}

// Type-safe error thrower for common scenarios
export const throwError = {
  validation: (message: string, details?: any): never => {
    throw new ValidationError(message, details)
  },
  
  authentication: (message?: string): never => {
    throw new AuthenticationError(message)
  },
  
  authorization: (message?: string): never => {
    throw new AuthorizationError(message)
  },
  
  notFound: (message?: string): never => {
    throw new NotFoundError(message)
  },
  
  conflict: (message: string, details?: any): never => {
    throw new ConflictError(message, details)
  },
  
  rateLimit: (message?: string): never => {
    throw new RateLimitError(message)
  },
  
  internal: (message?: string): never => {
    throw new InternalServerError(message)
  }
}

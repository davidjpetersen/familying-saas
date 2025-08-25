/**
 * Test API Route for Error Boundary Testing - FOR DEVELOPMENT ONLY
 * This helps test that API error handling is working correctly
 */

import { NextRequest } from 'next/server'
import { 
  withErrorHandling, 
  throwError,
  ApiError 
} from '@/lib/errors/api'

export const GET = withErrorHandling(async (request: NextRequest) => {
  const url = new URL(request.url)
  const errorType = url.pathname.split('/').pop()

  switch (errorType) {
    case '401':
      throwError.authentication('Test authentication error')
      
    case '403':
      throwError.authorization('Test authorization error')
      
    case '404':
      throwError.notFound('Test resource not found')
      
    case '400':
      throwError.validation('Test validation error', { field: 'test' })
      
    case '409':
      throwError.conflict('Test conflict error')
      
    case '429':
      throwError.rateLimit('Test rate limit error')
      
    case '500':
      throwError.internal('Test internal server error')
      
    case 'custom':
      throw new ApiError(418, "I'm a teapot", 'TEAPOT_ERROR')
      
    case 'unexpected':
      // Simulate unexpected error (not ApiError)
      throw new Error('Unexpected error for testing')
      
    default:
      return new Response('Error test route. Use /api/test-error/[401|403|404|500|custom|unexpected]', {
        status: 200
      })
  }
})

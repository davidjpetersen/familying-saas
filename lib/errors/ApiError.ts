// lib/errors/ApiError.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function jsonError(e: unknown) {
  if (e instanceof ApiError) {
    return Response.json({ error: e.message, code: e.code }, { status: e.statusCode });
  }
  return Response.json({ error: 'Internal server error' }, { status: 500 });
}

declare module '@vercel/flags/next' {
  /**
   * Retrieves the value of a flag.
   * The actual SDK provides more options, but for typing purposes we only
   * expose the minimal shape used in the app.
   */
  export function getFlag<T>(key: string): Promise<{ value: T }>;
}

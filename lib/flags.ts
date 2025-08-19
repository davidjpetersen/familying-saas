import { getFlag } from '@vercel/flags/next';

/**
 * Name of the feature flag used to control the new homepage banner.
 */
export const NEW_FEATURE_FLAG = 'new-feature';

/**
 * Fetches the flag value from Vercel Flags.
 *
 * @returns A boolean indicating whether the new feature is enabled.
 */
export async function isNewFeatureEnabled(): Promise<boolean> {
  const { value } = await getFlag<boolean>(NEW_FEATURE_FLAG);
  return Boolean(value);
}

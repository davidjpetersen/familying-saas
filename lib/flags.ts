import { getFlag } from 'flags/next';

/**
 * Name of the feature flag used to control the new homepage banner.
 */
export const NEW_FEATURE_FLAG = 'new-feature';

/**
 * Fetches the flag value using the Flags SDK.
 *
 * @returns A boolean indicating whether the new feature is enabled.
 */
export async function isNewFeatureEnabled(): Promise<boolean> {
  try {
    const { value } = await getFlag<boolean>(NEW_FEATURE_FLAG);
    return Boolean(value);
  } catch {
    return false;
  }
}

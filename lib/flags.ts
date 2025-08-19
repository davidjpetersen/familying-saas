export const NEW_FEATURE_FLAG = "new-feature";

/*
 * Checks the environment variable directly to determine the feature flag status.
 *
 * @returns A boolean indicating whether the new feature is enabled.
 */
export async function isNewFeatureEnabled(): Promise<boolean> {
  const raw = process.env.NEXT_PUBLIC_FLAG_NEW_FEATURE ?? "";
  return ["1", "true", "on", "yes"].includes(raw.toLowerCase());
}

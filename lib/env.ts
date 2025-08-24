import { z } from 'zod';

// Root app env schema
export const AppEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1).optional(),
});

export type AppEnv = z.infer<typeof AppEnvSchema>;

export function validateEnv(env: NodeJS.ProcessEnv = process.env): AppEnv {
  const parsed = AppEnvSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.format();
    const pretty = JSON.stringify(issues, null, 2);
    throw new Error(`Invalid environment variables. Fix and retry.\n${pretty}`);
  }
  return parsed.data;
}

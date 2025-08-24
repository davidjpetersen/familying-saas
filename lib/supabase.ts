import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * Server-only Supabase client.
 * Includes Clerk-backed accessToken() so RLS applies per user.
 * Do not import this from client components. Use API routes or lib/supabase.client.ts in the browser.
 */

export const createSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(
      "Supabase: NEXT_PUBLIC_SUPABASE_URL is missing. Add it to your .env.local (see .env.local.example)."
    );
  }
  if (!anonKey) {
    throw new Error(
      "Supabase: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Add it to your .env.local (see .env.local.example)."
    );
  }

  return createClient(
    url,
    anonKey,
    {
      async accessToken() {
        return (await auth()).getToken();
      },
    }
  );
};

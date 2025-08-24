import { createClient } from '@supabase/supabase-js';

// Client-safe Supabase factory: uses only public URL/key and NO Clerk imports.
// Do not use this in server routes where you need RLS via Clerk; prefer lib/supabase.ts there.
export const createSupabaseBrowserClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error('Supabase: NEXT_PUBLIC_SUPABASE_URL is missing.');
  }
  if (!anonKey) {
    throw new Error('Supabase: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.');
  }

  return createClient(url, anonKey);
};

export type SupabaseBrowser = ReturnType<typeof createSupabaseBrowserClient>;

import { SupabaseClient } from "@supabase/supabase-js";

export type SupabaseUri = { bucket: string; path: string };

export function parseSupabaseUri(uri?: string | null): SupabaseUri | null {
  if (!uri || typeof uri !== "string") return null;
  const prefix = "supabase://";
  if (!uri.startsWith(prefix)) return null;
  const rest = uri.slice(prefix.length);
  const [bucket, ...parts] = rest.split("/");
  if (!bucket || parts.length === 0) return null;
  return { bucket, path: parts.join("/") };
}

export async function uploadJson(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  data: unknown,
  opts: { upsert?: boolean } = {}
) {
  const body = JSON.stringify(data, null, 2);
  const blob = new Blob([body], { type: "application/json" });
  const { data: res, error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { contentType: "application/json", upsert: opts.upsert ?? true });
  if (error) throw error;
  return res;
}

export async function downloadJson<T = unknown>(
  supabase: SupabaseClient,
  bucket: string,
  path: string
): Promise<T> {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw error;
  const text = await data.text();
  return JSON.parse(text) as T;
}

export async function signFileUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  expiresInSeconds = 3600
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

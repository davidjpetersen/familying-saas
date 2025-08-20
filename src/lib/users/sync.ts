import { createClient } from "@supabase/supabase-js";

export type ClerkUserPayload = {
  clerkUserId: string;
  email: string | null;
};

function getServiceSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for server-side sync");
  return createClient(url, serviceKey);
}

export async function upsertUserFromClerk({ clerkUserId, email }: ClerkUserPayload) {
  const supabase = getServiceSupabaseClient();
  const { error } = await supabase
    .from("users")
    .upsert(
      { clerk_user_id: clerkUserId, email },
      { onConflict: "clerk_user_id" }
    );
  if (error) throw error;
}

export async function deleteUserByClerkId(clerkUserId: string) {
  const supabase = getServiceSupabaseClient();
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("clerk_user_id", clerkUserId);
  if (error) throw error;
}

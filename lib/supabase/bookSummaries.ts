import { createClient } from "@supabase/supabase-js";

function getServiceSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for server-side operations");
  return createClient(url, serviceKey);
}

export type BookSummaryRow = {
  id: string;
  document: any;
  schema_version: string | null;
  status: string | null;
  book: any;
  metadata: any;
  tags: string[] | null;
  owner: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function listBookSummaries({ page = 1, pageSize = 25, filters = {}, search }: { page?: number; pageSize?: number; filters?: Record<string, any>; search?: string }) {
  const supabase = getServiceSupabaseClient();
    let query = supabase.from("book_summaries").select("id,document,schema_version,status,book,metadata,tags,owner,created_at,updated_at", { count: "exact" });

  // Filters
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.schema_version) query = query.eq("schema_version", filters.schema_version);

  // Search owner or document->>title
  if (search) {
    query = query.or(`owner.ilike.%${search}%,document->>title.ilike.%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
    const { data, error, count } = await query.order("updated_at", { ascending: false }).range(from, to);
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function getBookSummary(id: string) {
  const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase.from("book_summaries").select("id,document,schema_version,status,book,metadata,tags,owner,created_at,updated_at").eq("id", id).single();
  if (error) throw error;
  return data as BookSummaryRow;
}

export async function createBookSummary(payload: Partial<BookSummaryRow>) {
  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase.from("book_summaries").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateBookSummary(id: string, payload: Partial<BookSummaryRow>) {
  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase.from("book_summaries").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteBookSummary(id: string) {
  const supabase = getServiceSupabaseClient();
  const { error } = await supabase.from("book_summaries").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function bulkDeleteBookSummaries(ids: string[]) {
  const supabase = getServiceSupabaseClient();
  const { error } = await supabase.from("book_summaries").delete().in("id", ids);
  if (error) throw error;
  return true;
}

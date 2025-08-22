import { createClient } from "@supabase/supabase-js";
import { zSummary } from "../zSummary";

function getServiceSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for server-side operations");
  return createClient(url, serviceKey);
}

function generateId() {
  return `bs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
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

export async function createBookSummary(payload: Partial<BookSummaryRow>, userId?: string) {
  const supabase = getServiceSupabaseClient();
  // Ensure server-generated id
  const id = payload.id ?? generateId();

  // Basic schema validation via zod
  try {
    zSummary.parse({
      schema_version: payload.schema_version ?? undefined,
      status: payload.status ?? undefined,
      owner: payload.owner ?? undefined,
      tags: payload.tags ?? [],
      document: payload.document ?? {},
      book: payload.book ?? {},
      metadata: payload.metadata ?? {}
    });
  } catch (e: any) {
    throw new Error(`validation: ${e?.message ?? String(e)}`);
  }

  const insert = {
    id,
    document: payload.document ?? {},
    schema_version: payload.schema_version ?? null,
    status: payload.status ?? 'draft',
    book: payload.book ?? null,
    metadata: payload.metadata ?? null,
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    owner: payload.owner ?? null
  };

  const { data, error } = await supabase.from("book_summaries").insert(insert).select().single();
  if (error) throw error;

  // Audit log (best-effort)
  try {
    await supabase.from('book_summaries_audit').insert({ summary_id: id, user_id: userId ?? null, action: 'create', changes: insert });
  } catch (_) {}

  return data;
}

export async function updateBookSummary(id: string, payload: Partial<BookSummaryRow>, userId?: string) {
  const supabase = getServiceSupabaseClient();

  // Validate minimally
  try {
    zSummary.parse({
      schema_version: payload.schema_version ?? undefined,
      status: payload.status ?? undefined,
      owner: payload.owner ?? undefined,
      tags: payload.tags ?? [],
      document: payload.document ?? {},
      book: payload.book ?? {},
      metadata: payload.metadata ?? {}
    });
  } catch (e: any) {
    throw new Error(`validation: ${e?.message ?? String(e)}`);
  }

  const { data, error } = await supabase.from("book_summaries").update(payload).eq("id", id).select().single();
  if (error) throw error;

  try {
    await supabase.from('book_summaries_audit').insert({ summary_id: id, user_id: userId ?? null, action: 'update', changes: payload });
  } catch (_) {}

  return data;
}

export async function deleteBookSummary(id: string, userId?: string) {
  const supabase = getServiceSupabaseClient();
  const { error } = await supabase.from("book_summaries").delete().eq("id", id);
  if (error) throw error;

  try {
    await supabase.from('book_summaries_audit').insert({ summary_id: id, user_id: userId ?? null, action: 'delete', changes: null });
  } catch (_) {}

  return true;
}

export async function bulkDeleteBookSummaries(ids: string[], userId?: string) {
  const supabase = getServiceSupabaseClient();
  const { error } = await supabase.from("book_summaries").delete().in("id", ids);
  if (error) throw error;

  try {
    const rows = ids.map((id) => ({ summary_id: id, user_id: userId ?? null, action: 'delete', changes: null }));
    await supabase.from('book_summaries_audit').insert(rows);
  } catch (_) {}

  return true;
}

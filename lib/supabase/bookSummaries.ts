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
  status: string | null;
  book: any;
  metadata: any;
  tags: string[] | null;
  owner: string | null;
  owner_user_id?: string | null;
  slug?: string | null;
  isbn_10?: string | null;
  isbn_13?: string | null;
  canonical_url?: string | null;
  publisher?: string | null;
  publication_date?: string | null;
  edition?: string | null;
  language_code?: string | null;
  page_count?: number | null;
  series_name?: string | null;
  series_number?: number | null;
  toc?: any;
  notable_quotes?: any;
  source_citations?: any;
  content_warnings?: string[] | null;
  audience?: string | null;
  difficulty?: string | null;
  reading_time_minutes?: number | null;
  audio_duration_minutes?: number | null;
  cover_image_path?: string | null;
  pdf_path?: string | null;
  audio_path?: string | null;
  version?: number | null;
  qa_flags?: any;
  moderation_notes?: string | null;
  view_count?: number | null;
  favorite_count?: number | null;
  rating_count?: number | null;
  rating_avg?: number | null;
  visibility?: string | null;
  locale?: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function listBookSummaries({ page = 1, pageSize = 25, filters = {}, search }: { page?: number; pageSize?: number; filters?: Record<string, any>; search?: string }) {
  const supabase = getServiceSupabaseClient();
    let query = supabase.from("book_summaries").select(
  `id,document,status,book,metadata,tags,owner,owner_user_id,slug,isbn_10,isbn_13,canonical_url,publisher,publication_date,edition,language_code,page_count,series_name,series_number,toc,notable_quotes,source_citations,content_warnings,audience,difficulty,reading_time_minutes,audio_duration_minutes,cover_image_path,pdf_path,audio_path,version,qa_flags,moderation_notes,view_count,favorite_count,rating_count,rating_avg,visibility,locale,created_at,updated_at`,
      { count: "exact" }
    );

  // Filters
  if (filters.status) query = query.eq("status", filters.status);
  // schema_version removed from UI and queries

  // Search owner or title in document/book
  if (search) {
    query = query.or(`owner.ilike.%${search}%,document->>title.ilike.%${search}%,book->>title.ilike.%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
    const { data, error, count } = await query.order("updated_at", { ascending: false }).range(from, to);
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function getBookSummary(id: string) {
  const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase.from("book_summaries").select(
  `id,document,status,book,metadata,tags,owner,owner_user_id,slug,isbn_10,isbn_13,canonical_url,publisher,publication_date,edition,language_code,page_count,series_name,series_number,toc,notable_quotes,source_citations,content_warnings,audience,difficulty,reading_time_minutes,audio_duration_minutes,cover_image_path,pdf_path,audio_path,version,qa_flags,moderation_notes,view_count,favorite_count,rating_count,rating_avg,visibility,locale,created_at,updated_at`
    ).eq("id", id).single();
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

  // Build insert object: include provided payload fields so new bibliographic fields persist.
  const insert: any = {
    id,
    // ensure core defaults
    document: payload.document ?? {},
    status: payload.status ?? 'draft',
    book: payload.book ?? null,
    metadata: payload.metadata ?? null,
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    owner: payload.owner ?? null,
    // spread any other provided top-level fields (isbn, publisher, slug, etc.)
    ...payload
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

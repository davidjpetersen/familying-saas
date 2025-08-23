import { createClient } from "@supabase/supabase-js";

function getServiceSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for server-side operations");
  return createClient(url, serviceKey);
}

export async function buildSummaryPayloadById(summaryId: string) {
  const supabase = getServiceSupabaseClient();

  const { data: s, error: sErr } = await supabase
    .from("summaries")
    .select(
      "id, book_id, is_published, render_version, payload_uri, pdf_uri, title, subtitle, overview, key_insights, chapter_summaries, tags, updated_at, books:book_id ( id, slug, title, subtitle, authors, lang, cover_uri, affiliate_links )"
    )
    .eq("id", summaryId)
    .single();
  if (sErr) throw sErr;
  if (!s) throw new Error("summary not found");

  const book = (s as any).books || {};
  const payload = {
    payload_version: 1,
    render_version: s.render_version ?? 1,
    book: {
      id: book.id,
      slug: book.slug,
      title: book.title,
      subtitle: book.subtitle,
      authors: book.authors || [],
      lang: book.lang || "en",
      cover_url: book.cover_uri || null,
      affiliate_links: book.affiliate_links || [],
    },
    summary: {
      title: s.title || book.title,
      subtitle: s.subtitle || book.subtitle || null,
      overview: s.overview || "",
      key_insights: s.key_insights || [],
      chapter_summaries: s.chapter_summaries || [],
      tags: s.tags || [],
      updated_at: s.updated_at,
    },
    assets: {
      pdf_url: null as string | null,
      audio_url: null as string | null,
    },
    share: {
      share_url: null as string | null,
    },
  };
  return payload;
}

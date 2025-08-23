import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET(req: Request) {
  const supabase = createSupabaseClient();
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  if (!q) return NextResponse.json({ rows: [] });
  // Lexical search over books + summaries where published
  const { data, error } = await supabase
    .from('books')
    .select('id, slug, title, authors, cover_uri, summaries: summaries ( is_published, tags )')
    .ilike('title', `%${q}%`)
    .limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = (data || [])
    .filter((b: any) => (Array.isArray(b.summaries) ? b.summaries[0]?.is_published : b.summaries?.is_published))
    .map((b: any) => ({ id: b.id, slug: b.slug, title: b.title, authors: b.authors || [], cover_url: b.cover_uri || null }));
  return NextResponse.json({ rows });
}

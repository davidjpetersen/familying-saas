import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const supabase = createSupabaseClient();
    const url = new URL(req.url);
    const tag = url.searchParams.get('tag') || undefined;
    const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize') || '24')));

    // Simplified join: list books that have a published summary
    let query = supabase
      .from('summaries')
      .select('id, book_id, tags, updated_at, books:book_id ( id, slug, title, subtitle, authors, lang, cover_uri )')
      .eq('is_published', true);

    if (tag) query = query.contains('tags', [tag]);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await query.order('updated_at', { ascending: false }).range(from, to);
    if (error) throw error;

    const rows = (data || []).map((r: any) => ({
      id: r.books?.id,
      slug: r.books?.slug,
      title: r.books?.title,
      authors: r.books?.authors || [],
      cover_url: r.books?.cover_uri || null,
      tags: r.tags || [],
    }));

    return NextResponse.json({ rows, page, pageSize, total: rows.length });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

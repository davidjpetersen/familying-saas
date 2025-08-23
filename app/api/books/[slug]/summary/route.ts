import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { downloadJson, parseSupabaseUri } from '@/lib/storage';

export async function GET(_req: Request, { params }: { params: { slug: string }}) {
  try {
    const supabase = createSupabaseClient();
    // Find book by slug and join published summary
    const { data: books, error: bErr } = await supabase
      .from('books')
      .select('id, slug, title, subtitle, authors, lang, cover_uri, affiliate_links, summaries: summaries ( id, is_published, render_version, payload_uri, pdf_uri, title, subtitle, overview, key_insights, chapter_summaries, tags, updated_at )')
      .eq('slug', params.slug)
      .limit(1);
    if (bErr) throw bErr;
    if (!books || books.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const book = books[0];
    const summary = Array.isArray(book.summaries) ? book.summaries[0] : book.summaries;
    if (!summary || !summary.is_published) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // If payload_uri exists, fetch and return it; else assemble a minimal payload inline
    if (summary.payload_uri) {
      const parsed = parseSupabaseUri(summary.payload_uri as string);
      if (parsed) {
    try {
          const payload = await downloadJson<any>(supabase, parsed.bucket, parsed.path);
          return NextResponse.json(payload);
  } catch {
          // fall through to inline payload
        }
      }
    }

    const payload = {
      payload_version: 1,
      render_version: summary.render_version ?? 1,
      book: {
        id: book.id,
        slug: book.slug,
        title: book.title,
        subtitle: book.subtitle,
        authors: book.authors || [],
        lang: book.lang || 'en',
        cover_url: book.cover_uri || null,
        affiliate_links: book.affiliate_links || [],
      },
      summary: {
        title: summary.title || book.title,
        subtitle: summary.subtitle || book.subtitle || null,
        overview: summary.overview || '',
        key_insights: summary.key_insights || [],
        chapter_summaries: summary.chapter_summaries || [],
        tags: summary.tags || [],
        updated_at: summary.updated_at,
      },
      assets: {
        pdf_url: null,
        audio_url: null,
      },
      share: {
        share_url: null,
      },
    };

    return NextResponse.json(payload);
  } catch (e) {
    return NextResponse.json({ error: String((e as Error)?.message || e) }, { status: 500 });
  }
}

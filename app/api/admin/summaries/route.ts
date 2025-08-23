import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const supabase = createSupabaseClient();
  const { data: adminRow } = await supabase.from('admins').select('*').eq('clerk_user_id', userId).limit(1).maybeSingle();
  if (!adminRow) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize') || '25')));
  const is_published = url.searchParams.get('is_published');

  let query = supabase
    .from('summaries')
    .select('id, book_id, is_published, render_version, title, overview, tags, updated_at, books:book_id ( id, slug, title, authors, cover_uri )');
  if (is_published === 'true') query = query.eq('is_published', true);
  if (is_published === 'false') query = query.eq('is_published', false);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error } = await query.order('updated_at', { ascending: false }).range(from, to);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, page, pageSize });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const supabase = createSupabaseClient();
  const { data: adminRow } = await supabase.from('admins').select('*').eq('clerk_user_id', userId).limit(1).maybeSingle();
  if (!adminRow) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await req.json();
  if (!body?.book_id) return NextResponse.json({ error: 'book_id required' }, { status: 400 });
  const insert = {
    book_id: body.book_id,
    owner_user_id: String(adminRow.user_id || adminRow.clerk_user_id || userId),
    is_published: false,
    render_version: 1,
    title: body.title || null,
    subtitle: body.subtitle || null,
    overview: body.overview || null,
    key_insights: body.key_insights || [],
    chapter_summaries: body.chapter_summaries || [],
    tags: body.tags || [],
  };
  const { data, error } = await supabase.from('summaries').insert(insert).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

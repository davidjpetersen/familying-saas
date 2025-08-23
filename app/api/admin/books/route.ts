import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const supabase = createSupabaseClient();
  const { data: adminRow } = await supabase.from('admins').select('*').eq('clerk_user_id', userId).limit(1).maybeSingle();
  if (!adminRow) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get('pageSize') || '25')));

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error } = await supabase
    .from('books')
    .select('id, slug, title, subtitle, authors, lang, cover_uri, source_uri, affiliate_links, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .range(from, to);
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
  const insert = {
    owner_user_id: String(body.owner_user_id || adminRow.user_id || adminRow.clerk_user_id || userId),
    title: body.title || 'Untitled',
    subtitle: body.subtitle || null,
    authors: Array.isArray(body.authors) ? body.authors : [],
    lang: body.lang || 'en',
    cover_uri: body.cover_uri || null,
    source_uri: body.source_uri || null,
    affiliate_links: Array.isArray(body.affiliate_links) ? body.affiliate_links : [],
  };
  const { data, error } = await supabase.from('books').insert(insert).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

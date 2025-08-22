import { NextResponse } from 'next/server'
import { listBookSummaries, createBookSummary } from '../../../../lib/supabase/bookSummaries'
import { auth } from '@clerk/nextjs/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(req: Request) {
  // Admin-only
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const supabase = createSupabaseClient();
  const { data: adminRow } = await supabase.from('admins').select('*').eq('clerk_user_id', userId).limit(1).maybeSingle();
  if (!adminRow) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') || '1');
  const pageSize = Number(url.searchParams.get('pageSize') || '25');
  const search = url.searchParams.get('search') || undefined;
  const filters: any = {};
  if (url.searchParams.get('status')) filters.status = url.searchParams.get('status');

  try {
  const { data, count } = await listBookSummaries({ page, pageSize, filters, search });
    return NextResponse.json({ data, count });
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Admin-only
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const supabase = createSupabaseClient();
  const { data: adminRow } = await supabase.from('admins').select('*').eq('clerk_user_id', userId).limit(1).maybeSingle();
  if (!adminRow) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const body = await req.json();
    const created = await createBookSummary(body, userId);
    return NextResponse.json(created);
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
}

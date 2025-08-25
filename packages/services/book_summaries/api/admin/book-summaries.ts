import { NextResponse } from 'next/server';
import { listBookSummaries, createBookSummary } from '@/lib/supabase/bookSummaries';
import { withAdminApi } from '@/lib/auth/withAdmin';
import type { ApiContext } from '@familying/feature-registry';

export const GET = withAdminApi(async ({ userId, req, params }) => {
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
});

export const POST = withAdminApi(async ({ userId, req, params }) => {
  try {
    const body = await req.json();
    const created = await createBookSummary(body, userId);
    return NextResponse.json(created);
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
});

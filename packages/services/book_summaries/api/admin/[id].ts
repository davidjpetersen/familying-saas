import { NextResponse } from 'next/server';
import { getBookSummary, updateBookSummary, deleteBookSummary } from '@/lib/supabase/bookSummaries';
import { withAdminApi } from '@/lib/auth/withAdmin';
import type { ApiContext } from '@familying/feature-registry';

export const GET = withAdminApi(async ({ userId, req, params }) => {
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: 'missing id' }, { status: 400 });
  }

  try {
    const data = await getBookSummary(id);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
});

export const PUT = withAdminApi(async ({ userId, req, params }) => {
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: 'missing id' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const updated = await updateBookSummary(id, body, userId);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
});

export const DELETE = withAdminApi(async ({ userId, req, params }) => {
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: 'missing id' }, { status: 400 });
  }

  try {
    await deleteBookSummary(id, userId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
});

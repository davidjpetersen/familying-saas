import { NextResponse } from 'next/server';
import { bulkDeleteBookSummaries } from '@/lib/supabase/bookSummaries';
import { withAdminApi } from '@/lib/auth/withAdmin';
import type { ApiContext } from '@familying/feature-registry';

export const POST = withAdminApi(async ({ userId, req, params }) => {
  try {
    const { ids } = await req.json();
    await bulkDeleteBookSummaries(ids, userId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
});

import { NextResponse } from 'next/server'
import { bulkDeleteBookSummaries } from '../../../../../lib/supabase/bookSummaries'
import { auth } from '@clerk/nextjs/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const supabase = createSupabaseClient();
  const { data: adminRow } = await supabase.from('admins').select('*').eq('clerk_user_id', userId).limit(1).maybeSingle();
  if (!adminRow) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  try {
    const { ids } = await req.json();
    await bulkDeleteBookSummaries(ids, userId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
}

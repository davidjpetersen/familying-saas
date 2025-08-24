import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';
import type { ApiContext } from '@familying/feature-registry';

// Admin check helper
async function checkAdmin(userId?: string | null) {
  if (!userId) return false;
  const supabase = createSupabaseClient();
  const { data: adminRow } = await supabase.from('admins').select('*').eq('clerk_user_id', userId).limit(1).maybeSingle();
  return !!adminRow;
}

export async function GET(req: Request, ctx?: ApiContext) {
  const { userId } = await auth();
  if (!userId || !(await checkAdmin(userId))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ error: 'Supabase service key missing' }, { status: 500 });
    
    const supabase = createClient(url, key);
    const id = ctx?.params?.id;
    const summaryId = id === '_all' ? undefined : id;
    
    let q = supabase.from('book_summaries_audit').select('*').order('created_at', { ascending: false }).limit(10);
    if (summaryId) q = q.eq('summary_id', summaryId);
    
    const { data, error } = await q;
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
}

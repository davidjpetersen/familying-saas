import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAdminApi } from '@/lib/auth/withAdmin';
import type { ApiContext } from '@familying/feature-registry';

export const GET = withAdminApi(async ({ userId, req, params }) => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ error: 'Supabase service key missing' }, { status: 500 });
    
    const supabase = createClient(url, key);
    const id = params?.id;
    const summaryId = id === '_all' ? undefined : id;
    
    let q = supabase.from('book_summaries_audit').select('*').order('created_at', { ascending: false }).limit(10);
    if (summaryId) q = q.eq('summary_id', summaryId);
    
    const { data, error } = await q;
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
});

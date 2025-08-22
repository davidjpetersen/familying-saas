import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url || '', key || '');

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id === '_all' ? undefined : params.id;
    let q = supabase.from('book_summaries_audit').select('*').order('created_at', { ascending: false }).limit(10);
    if (id) q = q.eq('summary_id', id);
    const { data, error } = await q;
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
}

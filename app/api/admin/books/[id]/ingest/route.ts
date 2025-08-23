import { NextResponse } from 'next/server';
import { enqueueIngest } from '@/lib/actions/ingest';
import { createSupabaseClient } from '@/lib/supabase';

export async function POST(_req: Request, { params }: { params: { id: string }}) {
  try {
    const supabase = createSupabaseClient();
  const { data, error } = await supabase.from('books').select('owner_user_id, source_uri').eq('id', params.id).single();
    if (error) throw error;
  const owner_user_id = String((data as any)?.owner_user_id || '');
    const source_uri = (data as any)?.source_uri as string | null;
    await enqueueIngest({ book_id: params.id, owner_user_id, source_uri });
    return NextResponse.json({ job_id: `ingest_${params.id}_${Date.now()}` }, { status: 202 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to enqueue' }, { status: 500 });
  }
}

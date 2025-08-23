import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { parseSupabaseUri, signFileUrl } from '@/lib/storage';

export async function GET(_req: Request, { params }: { params: { id: string }}) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from('summaries').select('pdf_uri').eq('id', params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const uri = (data as any)?.pdf_uri as string | null;
  if (!uri) return NextResponse.json({ error: 'Not ready' }, { status: 404 });
  const parsed = parseSupabaseUri(uri);
  if (!parsed) return NextResponse.json({ error: 'Invalid pdf_uri' }, { status: 500 });
  try {
    const signed = await signFileUrl(supabase, parsed.bucket, parsed.path, 600);
    return NextResponse.redirect(signed, { status: 302 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to sign URL' }, { status: 500 });
  }
}

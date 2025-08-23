import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { uploadJson } from '@/lib/storage';
import { buildSummaryPayloadById } from '@/lib/payloads';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: summaryId } = await params;
    const supabase = createSupabaseClient();

    // Read current summary
    const { data: s, error: sErr } = await supabase
      .from('summaries')
      .select('id, is_published, render_version')
      .eq('id', summaryId)
      .single();
    if (sErr) throw sErr;
    if (!s) throw new Error('Not found');
    if (!s.is_published) {
      return NextResponse.json({ error: 'Summary must be published before rendering' }, { status: 400 });
    }

    const nextRenderVersion = (s.render_version ?? 1) + 1;

    // Build payload JSON
    const payload = await buildSummaryPayloadById(summaryId);
    payload.render_version = nextRenderVersion;

    // Determine storage path and upload JSON
    const payloadBucket = 'summaries';
    const payloadPath = `payloads/${summaryId}/v${nextRenderVersion}/payload.json`;
    await uploadJson(supabase, payloadBucket, payloadPath, payload, { upsert: true });

    // Update row with payload_uri and render_version; PDF generation left as follow-up worker
    const payloadUri = `supabase://${payloadBucket}/${payloadPath}`;
    const { error: uErr } = await supabase
      .from('summaries')
      .update({ render_version: nextRenderVersion, payload_uri: payloadUri })
      .eq('id', summaryId);
    if (uErr) throw uErr;

    return NextResponse.json({ job_id: `render_${summaryId}_${Date.now()}`, next_render_version: nextRenderVersion }, { status: 202 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

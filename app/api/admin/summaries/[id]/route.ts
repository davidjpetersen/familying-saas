import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function PATCH(req: Request, { params }: { params: { id: string }}) {
  try {
    const body = await req.json();
    const supabase = createSupabaseClient();
    // If toggling publish, enforce constraints
    if (typeof body.is_published === 'boolean' && body.is_published === true) {
      const overview = typeof body.overview === 'string' ? body.overview : undefined;
      const key_insights = Array.isArray(body.key_insights) ? body.key_insights : undefined;
      // Fetch existing row to validate if not provided in body
      if (!overview || !key_insights) {
        const { data: row, error: rErr } = await supabase
          .from('summaries')
          .select('overview, key_insights')
          .eq('id', params.id)
          .single();
        if (rErr) throw rErr;
        if (!overview) body.overview = row?.overview;
        if (!key_insights) body.key_insights = row?.key_insights;
      }
      const insightsCount = Array.isArray(body.key_insights) ? body.key_insights.length : 0;
      if (!body.overview || insightsCount < 3 || insightsCount > 7) {
        return NextResponse.json({ error: 'Cannot publish: overview required and 3–7 key_insights.' }, { status: 400 });
      }
    }

    body.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('summaries').update(body).eq('id', params.id).select('*').single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

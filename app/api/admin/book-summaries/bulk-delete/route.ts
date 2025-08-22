import { NextResponse } from 'next/server'
import { bulkDeleteBookSummaries } from '../../../../../lib/supabase/bookSummaries'

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();
    await bulkDeleteBookSummaries(ids);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
}

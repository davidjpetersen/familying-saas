import { NextResponse } from 'next/server';
import { enqueueEmbed } from '@/lib/actions/embed';

export async function POST(_req: Request, { params }: { params: { id: string }}) {
  try {
    await enqueueEmbed({ book_id: params.id });
    return NextResponse.json({ job_id: `embed_${params.id}_${Date.now()}` }, { status: 202 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to enqueue' }, { status: 500 });
  }
}

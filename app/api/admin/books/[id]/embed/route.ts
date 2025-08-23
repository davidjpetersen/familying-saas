import { NextResponse } from 'next/server';
import { enqueueEmbed } from '@/lib/actions/embed';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await enqueueEmbed({ book_id: id });
    return NextResponse.json({ job_id: `embed_${id}_${Date.now()}` }, { status: 202 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to enqueue' }, { status: 500 });
  }
}

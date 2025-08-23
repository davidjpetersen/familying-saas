import { NextResponse } from 'next/server';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  // TODO: persist share slug and generate OG image
  const { id } = await params;
  const share_url = `/s/${id}`;
  const og_image_url = `/api/og/summary/${id}`;
  return NextResponse.json({ share_url, og_image_url });
}

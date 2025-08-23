import { NextResponse } from 'next/server';

export async function POST(_req: Request, { params }: { params: { id: string }}) {
  // TODO: persist share slug and generate OG image
  const share_url = `/s/${params.id}`;
  const og_image_url = `/api/og/summary/${params.id}`;
  return NextResponse.json({ share_url, og_image_url });
}

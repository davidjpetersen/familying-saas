import { NextResponse } from 'next/server';

const CLERK_COMMERCE_URL = 'https://api.clerk.com/v1/commerce/plans';

export async function GET() {
  if (!process.env.CLERK_API_KEY) {
    return NextResponse.json({ error: 'CLERK_API_KEY missing' }, { status: 400 });
  }

  try {
    const res = await fetch(CLERK_COMMERCE_URL, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: true, detail: json }, { status: res.status });
    }

    return NextResponse.json(json);
  } catch (err: any) {
    return NextResponse.json({ error: true, message: String(err?.message ?? err) }, { status: 500 });
  }
}

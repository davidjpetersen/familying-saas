import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const target = url.searchParams.get('target');
    const provider = url.searchParams.get('provider') || 'unknown';
    const bookId = url.searchParams.get('bookId') || '';

    if (!target) {
      return NextResponse.json({ error: 'missing target' }, { status: 400 });
    }

    // Basic tracking: log referral details server-side. Later this can be
    // recorded in Supabase or another analytics store and swapped for
    // affiliate URLs as needed.
    console.log('[referral] provider=', provider, 'bookId=', bookId, 'target=', target);

    // Redirect to the external URL.
    return NextResponse.redirect(target, 307);
  } catch (err) {
    console.error('referral redirect error', err);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}

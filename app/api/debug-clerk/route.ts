import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function GET() {
  if (process.env.NODE_ENV === 'production') return new NextResponse('Disabled in production', { status: 403 });
  try {
    const ccAny = clerkClient as any;
    const topKeys = Object.keys(ccAny || {}).slice(0, 200);
    let billingExists = false;
    let billingKeys: string[] = [];
    try {
      billingExists = Boolean(ccAny?.billing);
      if (billingExists) billingKeys = Object.keys(ccAny.billing || {}).slice(0, 200);
    } catch (e) {
      console.error('Error accessing billing:', e);
    }
    return NextResponse.json({ nodeEnv: process.env.NODE_ENV ?? null, topKeys, billingExists, billingKeys, hasClerkApiKey: Boolean(process.env.CLERK_API_KEY) });
  } catch (err: any) {
    return new NextResponse(String(err?.message ?? err), { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await auth();
    const userId = (session as any)?.userId;
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    // Use Clerk Billing APIs to fetch subscriptions for the user and derive plan/features
    // NOTE: Billing APIs are experimental; this implementation should be pinned to a known SDK version.

    // Log clerkClient shape for debugging (do not log secrets)
    try {
      const ccAny = clerkClient as any;
      const topKeys = Object.keys(ccAny || {}).slice(0, 50);
      console.log('[features route] clerkClient keys:', topKeys);
      console.log('[features route] clerkClient.billing exists:', Boolean(ccAny?.billing));
      if (ccAny?.billing) {
        try {
          console.log('[features route] clerkClient.billing keys:', Object.keys(ccAny.billing || {}).slice(0, 50));
        } catch (e) {
          console.log('[features route] error listing billing keys', String(e));
        }
      }
    } catch (logErr) {
      console.log('[features route] clerkClient logging error', String(logErr));
    }

    // Attempt to call billing via available client(s)
    try {
      let subsResponse: any = null;

      const ccAny = clerkClient as any;
      if (ccAny?.billing) {
        subsResponse = await ccAny.billing.subscriptions.list({ userId });
      } else if (process.env.CLERK_API_KEY) {
        // Attempt dynamic import of @clerk/backend to instantiate a backend client
        try {
          const backendMod = await import('@clerk/backend');
          const createClerkClient = backendMod?.createClerkClient;
          if (typeof createClerkClient === 'function') {
            const backend = createClerkClient({ secretKey: process.env.CLERK_API_KEY });
            try {
              const bkAny = backend as any;
              console.log('[features route] backend client keys:', Object.keys(bkAny || {}).slice(0,50));
              console.log('[features route] backend.billing exists:', Boolean(bkAny?.billing));
              if (bkAny?.billing) {
                try {
                  console.log('[features route] backend.billing keys:', Object.keys(bkAny.billing || {}).slice(0,50));
                } catch(e) { console.log('[features route] error listing backend.billing keys', String(e)); }
              }

              // Defensive: check for subscriptions.list function or other shape
              const subsListFn = bkAny?.billing?.subscriptions?.list;
              if (typeof subsListFn === 'function') {
                subsResponse = await subsListFn.call(bkAny.billing.subscriptions, { userId });
              } else if (bkAny?.billing?.subscriptions && typeof bkAny.billing.subscriptions === 'function') {
                // some SDK shapes may expose it directly as a function
                subsResponse = await bkAny.billing.subscriptions({ userId });
              } else {
                console.log('[features route] billing.subscriptions.list not available; shape may differ');
              }
            } catch(callErr) {
              console.log('[features route] backend billing call error', String(callErr));
            }
          } else {
            console.log('[features route] createClerkClient not found on @clerk/backend');
          }
        } catch (instErr) {
          console.log('[features route] backend ClerkClient billing call failed', String(instErr));
        }
      }

      if (subsResponse) {
        const subArray = Array.isArray(subsResponse) ? subsResponse : (subsResponse?.data ?? []);
        const active = subArray.find((s: any) => s.status === 'active') || subArray[0] || null;
        const plan = active?.plan?.name ?? 'Free';
        const features = active?.plan?.features ?? [];
        return NextResponse.json({ plan, features });
      }

      // If we reach here, billing wasn't available or the calls failed — fallback to Supabase
      try {
        const supabase = createSupabaseClient();
        const { data: publicFeatures } = await supabase.from('features').select('key');
        const keys = Array.isArray(publicFeatures) ? publicFeatures.map((f: any) => f.key) : [];
        return NextResponse.json({ plan: 'Free (fallback)', features: keys, debug: 'billing-unavailable' });
      } catch (supErr: any) {
        return new NextResponse(JSON.stringify({ error: true, message: String(supErr?.message ?? supErr) }), { status: 500 });
      }
    } catch (billingErr: any) {
      // Final catch for billing attempt — return a helpful payload
      try {
        const supabase = createSupabaseClient();
        const { data: publicFeatures } = await supabase.from('features').select('key');
        const keys = Array.isArray(publicFeatures) ? publicFeatures.map((f: any) => f.key) : [];
        return NextResponse.json({ plan: 'Free (fallback)', features: keys, debug: String(billingErr?.message ?? billingErr) });
      } catch (supErr: any) {
        return new NextResponse(JSON.stringify({ error: true, message: String(supErr?.message ?? supErr), billingError: String(billingErr?.message ?? billingErr) }), { status: 500 });
      }
    }
  } catch (err: any) {
    // Return more context for debugging in development
    const payload = { error: true, message: String(err?.message ?? err), stack: err?.stack };
    return new NextResponse(JSON.stringify(payload), { status: 500 });
  }
}

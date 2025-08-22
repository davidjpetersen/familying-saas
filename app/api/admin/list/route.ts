import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  try {
  const supabase = createSupabaseClient();
  // Ensure caller is an admin
  const { data: caller, error: callerErr } = await supabase.from('admins').select('*').eq('clerk_user_id', userId).limit(1).maybeSingle();
  if (callerErr) return NextResponse.json({ error: callerErr.message }, { status: 500 });
  if (!caller) return NextResponse.json({ error: 'not authorized' }, { status: 403 });

  const { data, error } = await supabase.from('admins').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}

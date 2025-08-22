import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  // Verify caller is listed in the admins table
  const supabase = createSupabaseClient();
  const { data: caller, error: callerErr } = await supabase.from('admins').select('*').eq('clerk_user_id', userId).limit(1).maybeSingle();
  if (callerErr) return NextResponse.json({ error: callerErr.message }, { status: 500 });
  if (!caller) return NextResponse.json({ error: 'not authorized' }, { status: 403 });

  // Manage admins: expect body { action: 'add'|'remove', clerk_user_id, email }
  const body = await req.json();
  const { action, clerk_user_id, email } = body as any;
  if (!action || !['add','remove'].includes(action)) return NextResponse.json({ error: 'invalid action' }, { status: 400 });

  if (action === 'add') {
    const id = clerk_user_id ?? email ?? `${Date.now().toString(36)}`;
    const { error } = await supabase.from('admins').insert({ id, clerk_user_id, email });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } else {
    const { error } = await supabase.from('admins').delete().or(`clerk_user_id.eq.${clerk_user_id},email.eq.${email}`);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
}

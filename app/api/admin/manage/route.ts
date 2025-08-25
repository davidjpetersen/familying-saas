import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { withAdminApi } from '@/lib/auth/withAdmin';

export const POST = withAdminApi(async ({ userId, req, params }) => {
  // Manage admins: expect body { action: 'add'|'remove', clerk_user_id, email }
  const body = await req.json();
  const { action, clerk_user_id, email } = body as any;
  if (!action || !['add','remove'].includes(action)) return NextResponse.json({ error: 'invalid action' }, { status: 400 });

  const supabase = createSupabaseClient();

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
});

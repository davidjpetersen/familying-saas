import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { withAdminApi } from '@/lib/auth/withAdmin';

export const GET = withAdminApi(async ({ userId, req, params }) => {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from('admins').select('*');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
});

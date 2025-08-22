import { NextResponse } from 'next/server'
import { getBookSummary, updateBookSummary, deleteBookSummary } from '../../../../../lib/supabase/bookSummaries'
import { auth } from '@clerk/nextjs/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(req: Request, context: any) {
  const params = context?.params || {};
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const supabase = createSupabaseClient();
  const { data: adminRow } = await supabase.from('admins').select('*').eq('clerk_user_id', userId).limit(1).maybeSingle();
  if (!adminRow) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const data = await getBookSummary(params.id);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
}

export async function PUT(req: Request, context: any) {
  const params = context?.params || {};
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const supabase = createSupabaseClient();
  const { data: adminRow } = await supabase.from('admins').select('*').eq('clerk_user_id', userId).limit(1).maybeSingle();
  if (!adminRow) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const body = await req.json();
    const updated = await updateBookSummary(params.id, body, userId);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  const params = context?.params || {};
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const supabase = createSupabaseClient();
  const { data: adminRow } = await supabase.from('admins').select('*').eq('clerk_user_id', userId).limit(1).maybeSingle();
  if (!adminRow) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    await deleteBookSummary(params.id, userId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
}

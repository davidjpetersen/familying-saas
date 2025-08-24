import { NextResponse } from 'next/server';
import { getBookSummary, updateBookSummary, deleteBookSummary } from '@/lib/supabase/bookSummaries';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';
import type { ApiContext } from '@familying/feature-registry';

// Admin check helper
async function checkAdmin(userId?: string | null) {
  if (!userId) return false;
  const supabase = createSupabaseClient();
  const { data: adminRow } = await supabase.from('admins').select('*').eq('clerk_user_id', userId).limit(1).maybeSingle();
  return !!adminRow;
}

export async function GET(req: Request, ctx?: ApiContext) {
  const { userId } = await auth();
  if (!userId || !(await checkAdmin(userId))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const id = ctx?.params?.id;
  if (!id) {
    return NextResponse.json({ error: 'missing id' }, { status: 400 });
  }

  try {
    const data = await getBookSummary(id);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx?: ApiContext) {
  const { userId } = await auth();
  if (!userId || !(await checkAdmin(userId))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const id = ctx?.params?.id;
  if (!id) {
    return NextResponse.json({ error: 'missing id' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const updated = await updateBookSummary(id, body, userId);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx?: ApiContext) {
  const { userId } = await auth();
  if (!userId || !(await checkAdmin(userId))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const id = ctx?.params?.id;
  if (!id) {
    return NextResponse.json({ error: 'missing id' }, { status: 400 });
  }

  try {
    await deleteBookSummary(id, userId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
}

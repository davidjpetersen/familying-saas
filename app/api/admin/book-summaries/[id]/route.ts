import { NextResponse } from 'next/server'
import { getBookSummary, updateBookSummary, deleteBookSummary } from '../../../../../../lib/supabase/bookSummaries'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await getBookSummary(params.id);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await updateBookSummary(params.id, body);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await deleteBookSummary(params.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
}

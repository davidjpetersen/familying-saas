import { NextResponse } from 'next/server';
import { fetchByIsbn, fetchByQuery } from '@/lib/books';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isbn = searchParams.get('isbn')?.trim() || '';
    const q = searchParams.get('q')?.trim() || '';
    const limitParam = Number(searchParams.get('limit'));
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 20) : 5;

    if (!isbn && !q) {
      return NextResponse.json({ error: 'Provide isbn or q' }, { status: 400 });
    }

    const data = isbn ? await fetchByIsbn(isbn, limit) : await fetchByQuery(q, limit);
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}

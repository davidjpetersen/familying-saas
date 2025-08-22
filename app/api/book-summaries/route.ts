import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
function generateId() {
  return `bs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
}

export async function GET(req: Request) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from('book_summaries').select('id, document, schema_version, status, tags, owner, created_at').order('created_at', { ascending: false }).limit(50);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const body = await req.json();
  // basic validation: require id, schema_version, status, book, metadata, insights, recommendations
  const required = ['id','schema_version','status','book','metadata','insights','recommendations'];
  for (const r of required) {
    if (!(r in body)) {
      return NextResponse.json({ error: `missing ${r}` }, { status: 400 });
    }
  }

  const supabase = createSupabaseClient();
  const id = body.id || generateId();
  const insert = {
    id,
    document: body,
    schema_version: body.schema_version,
    status: body.status,
    book: body.book || null,
    metadata: body.metadata || null,
    tags: Array.isArray(body.tags) ? body.tags : [],
    owner: body.owner || null
  };

  const { error } = await supabase.from('book_summaries').upsert(insert);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id });
}

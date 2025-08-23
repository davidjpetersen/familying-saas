import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const supabase = createSupabaseClient();
  const body = await req.json();
  if (!body.title) {
    return NextResponse.json({ error: "missing title" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("recipes")
    .upsert({ ...body })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

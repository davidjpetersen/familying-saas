import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

export async function GET(req: Request) {
  const supabase = createSupabaseClient();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .or(`is_public.eq.true,created_by.eq.${userId || ""}`);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

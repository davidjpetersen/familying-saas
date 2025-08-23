import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", params.id)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json({ data });
}

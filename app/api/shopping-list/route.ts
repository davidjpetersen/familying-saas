import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { startOfWeek } from "@/lib/mealPlanner";

export async function GET(req: Request) {
  const supabase = createSupabaseClient();
  const { searchParams } = new URL(req.url);
  const familyId = searchParams.get("family_id");
  if (!familyId) {
    return NextResponse.json({ error: "missing family_id" }, { status: 400 });
  }
  const weekStart = startOfWeek();
  const { data, error } = await supabase
    .from("meal_plans")
    .select("shopping_list")
    .eq("family_id", familyId)
    .eq("week_start", weekStart)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data: data?.shopping_list || {} });
}

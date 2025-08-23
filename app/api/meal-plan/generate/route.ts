import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { personalize, startOfWeek, Preferences } from "@/lib/mealPlanner";

export async function POST(req: Request) {
  const supabase = createSupabaseClient();
  const body = await req.json();
  const familyId = body.family_id;
  if (!familyId) {
    return NextResponse.json({ error: "missing family_id" }, { status: 400 });
  }
  const prefs: Preferences = {
    tags: body.tags,
    tech_level: body.tech_level,
    emotional_state: body.emotional_state,
    children: body.children,
  };

  const { data: recipes, error: recipeError } = await supabase
    .from("recipes")
    .select("*")
    .limit(20);
  if (recipeError) {
    return NextResponse.json({ error: recipeError.message }, { status: 500 });
  }
  const filtered = personalize(recipes || [], prefs).slice(0, 5);
  const weekStart = startOfWeek();
  const insert = {
    family_id: familyId,
    week_start: weekStart,
    plan: filtered,
    shopping_list: null,
  };
  const { data, error } = await supabase
    .from("meal_plans")
    .upsert(insert, { onConflict: "family_id,week_start" })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

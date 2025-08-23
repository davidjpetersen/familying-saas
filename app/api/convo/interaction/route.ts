import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = (await req.json()) as { cardId: string; action: "favorite"|"hide"|"rate"|"used"; rating?: number };
    const { cardId, action, rating } = body;
    const supabase = getServiceSupabaseClient();
    const payload: { user_id: string; card_id: string; favorite?: boolean; hidden?: boolean; rating?: number; used_at?: string } = { user_id: userId, card_id: cardId };
    switch (action) {
      case "favorite":
        payload.favorite = true;
        break;
      case "hide":
        payload.hidden = true;
        break;
      case "rate":
        payload.rating = rating;
        break;
      case "used":
        payload.used_at = new Date().toISOString();
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("convo_card_interactions")
      .upsert(payload, { onConflict: "user_id,card_id" })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message || e) }, { status: 500 });
  }
}

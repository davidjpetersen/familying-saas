import { ConvoDeck } from "@/types/convo";
import { NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service";

export async function GET() {
  try {
    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase
      .from("convo_decks")
      .select("id,title,subtitle,hero_image_url")
      .eq("status", "published");
    if (error) throw error;
    const decks = await Promise.all(
      ((data as ConvoDeck[] | null) || []).map(async (d) => {
        const { count } = await supabase
          .from("convo_deck_cards")
          .select("card_id", { count: "exact", head: true })
          .eq("deck_id", d.id);
        return { ...d, card_count: count || 0 };
      })
    );
    return NextResponse.json(decks);
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message || e) }, { status: 500 });
  }
}

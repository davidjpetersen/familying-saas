import { ConvoCard } from "@/types/convo";
import { NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServiceSupabaseClient();
    const { data: deck, error: deckErr } = await supabase
      .from("convo_decks")
      .select("id,title,subtitle,hero_image_url")
      .eq("id", params.id)
      .eq("status", "published")
      .single();
    if (deckErr) throw deckErr;
    const { data: mappings, error: mapErr } = await supabase
      .from("convo_deck_cards")
      .select("card_id,position")
      .eq("deck_id", params.id)
      .order("position");
    if (mapErr) throw mapErr;
    const mappingsData =
      (mappings as { card_id: string; position: number }[] | null) || [];
    const cardIds = mappingsData.map((m) => m.card_id);
    let cards: ConvoCard[] = [];
    if (cardIds.length) {
      const { data: cardRows, error: cardErr } = await supabase
        .from("convo_cards")
        .select(
          "id,prompt_text,follow_ups,age_variants,type,tags,tone"
        )
        .in("id", cardIds)
        .eq("status", "published");
      if (cardErr) throw cardErr;
      const map = new Map(
        ((cardRows as ConvoCard[] | null) || []).map(
          (c) => [c.id, c] as [string, ConvoCard]
        )
      );
      cards = mappingsData
        .map((m) => map.get(m.card_id)!)
        .filter(Boolean);
    }
    return NextResponse.json({ deck, cards });
  } catch (e) {
    return NextResponse.json(
      { error: String((e as Error).message || e) },
      { status: 500 }
    );
  }
}

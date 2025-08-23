import { NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service";
import { AgeBand, ConvoCard } from "@/types/convo";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const context = url.searchParams.get("context") || undefined;
    const ageBand = url.searchParams.get("ageBand") as AgeBand | null;
    const limit = Number(url.searchParams.get("limit") || "10");
    const supabase = getServiceSupabaseClient();
    const query = supabase
      .from("convo_cards")
      .select("id,prompt_text,follow_ups,age_variants,type,tags,tone")
      .eq("status", "published");
    let cards: ConvoCard[] = [];
    if (context) {
      const { data } = await query
        .contains("tags->context", [context])
        .limit(limit);
      if (data?.length) cards = data as ConvoCard[];
    }
    if (!cards.length) {
      const { data } = await query.limit(limit);
      cards = (data as ConvoCard[] | null) || [];
    }
    const mapped = cards.map((c) => ({
      ...c,
      prompt_text:
        ageBand && c.age_variants && c.age_variants[ageBand]
          ? c.age_variants[ageBand]
          : c.prompt_text,
    }));
    return NextResponse.json(mapped);
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message || e) }, { status: 500 });
  }
}

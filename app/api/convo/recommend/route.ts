import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceSupabaseClient } from "@/lib/supabase/service";
import { AgeBand, ConvoCard } from "@/types/convo";

function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { ageBand, context, limit = 5 } = body as {
      ageBand?: AgeBand;
      context?: string;
      limit?: number;
    };
    const supabase = getServiceSupabaseClient();
    const { data: interactions } = await supabase
      .from("convo_card_interactions")
      .select("card_id, hidden, used_at")
      .eq("user_id", userId);
    const hidden = new Set<string>();
    const used = new Set<string>();
    const now = Date.now();
    interactions?.forEach((i) => {
      if (i.hidden) hidden.add(i.card_id);
      if (i.used_at && now - new Date(i.used_at).getTime() < 14 * 24 * 60 * 60 * 1000)
        used.add(i.card_id);
    });
    const { data: cards } = await supabase
      .from("convo_cards")
      .select("id,prompt_text,follow_ups,age_variants,type,tags,tone")
      .eq("status", "published");
    const cardRows = (cards as ConvoCard[] | null) || [];
    const scored = cardRows
      .filter((c) => !hidden.has(c.id) && !used.has(c.id))
      .map((c) => {
        let score = 0;
        if (
          context &&
          Array.isArray(c.tags?.context) &&
          c.tags.context.includes(context)
        )
          score += 0.6;
        if (ageBand && c.age_variants && c.age_variants[ageBand]) score += 0.5;
        return { card: c, score };
      });
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 20);
    shuffle(top);
    const selected = top.slice(0, limit).map((s) => ({
      ...s.card,
      prompt_text:
        ageBand && s.card.age_variants && s.card.age_variants[ageBand]
          ? s.card.age_variants[ageBand]
          : s.card.prompt_text,
    }));
    return NextResponse.json(selected);
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message || e) }, { status: 500 });
  }
}

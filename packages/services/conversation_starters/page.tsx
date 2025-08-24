"use client";

import { useEffect, useState } from "react";
import QuickStart from "@/components/convo/QuickStart";
import DeckCard from "@/components/convo/DeckCard";
import Player from "@/components/convo/Player";
import { ConvoDeck, AgeBand } from "@/types/convo";
import { track } from "@/lib/analytics";

export default function ConversationStartersPage() {
  const [decks, setDecks] = useState<
    (ConvoDeck & { card_count: number })[]
  >([]);
  const [playing, setPlaying] = useState(false);
  const [context, setContext] = useState<string | undefined>();
  const [ageBand, setAgeBand] = useState<AgeBand | undefined>();

  useEffect(() => {
    fetch("/api/conversation_starters/decks")
      .then((r) => r.json())
      .then(setDecks);
    track("convo_view_home");
  }, []);

  return (
    <div className="p-4 space-y-8">
      <QuickStart
        onStart={(c, a) => {
          setContext(c);
          setAgeBand(a);
          setPlaying(true);
        }}
      />
      <div className="flex gap-4 flex-wrap">
        {decks.map((d) => (
          <DeckCard key={d.id} deck={d} />
        ))}
      </div>
      {playing && (
        <Player
          context={context}
          ageBand={ageBand}
          onClose={() => setPlaying(false)}
        />
      )}
    </div>
  );
}

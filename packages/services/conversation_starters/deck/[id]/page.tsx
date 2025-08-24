"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Player from "@/components/convo/Player";
import Card from "@/components/convo/Card";
import { ConvoDeck, ConvoCard } from "@/types/convo";
import { track } from "@/lib/analytics";

export default function DeckPage() {
  const params = useParams<{ id: string }>();
  const [deck, setDeck] = useState<ConvoDeck | null>(null);
  const [cards, setCards] = useState<ConvoCard[]>([]);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    fetch(`/api/convo/decks/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setDeck(d.deck);
        setCards(d.cards);
      });
    track("convo_deck_open", { deckId: id });
  }, [params.id]);

  if (!deck) return null;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">{deck.title}</h1>
      {deck.subtitle && (
        <p className="text-sm text-gray-500">{deck.subtitle}</p>
      )}
      <button
        className="px-4 py-2 border rounded"
        onClick={() => setPlaying(true)}
        aria-label="Play deck"
      >
        Play
      </button>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {cards.map((c) => (
          <Card key={c.id} card={c} />
        ))}
      </div>
      {playing && <Player cards={cards} onClose={() => setPlaying(false)} />}
    </div>
  );
}

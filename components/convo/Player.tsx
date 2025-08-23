"use client";

import { useEffect, useState } from "react";
import { ConvoCard, AgeBand } from "@/types/convo";
import { track } from "@/lib/analytics";

export default function Player({
  cards: initialCards = [],
  context,
  ageBand,
  onClose,
}: {
  cards?: ConvoCard[];
  context?: string;
  ageBand?: AgeBand;
  onClose?: () => void;
}) {
  const [cards, setCards] = useState<ConvoCard[]>(initialCards);
  const [index, setIndex] = useState(0);
  const [showFollowUps, setShowFollowUps] = useState(false);

  useEffect(() => {
    if (!initialCards.length) {
      const params = new URLSearchParams();
      if (context) params.set("context", context);
      if (ageBand) params.set("ageBand", ageBand);
      params.set("limit", "50");
      fetch(`/api/convo/cards?${params.toString()}`)
        .then((r) => r.json())
        .then((d) => setCards(d));
    }
  }, [context, ageBand, initialCards]);

  useEffect(() => {
    const card = cards[index];
    if (card) track("convo_card_view", { cardId: card.id });
  }, [index, cards]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + cards.length) % cards.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  if (!cards.length) return null;
  const card = cards[index];

  async function action(act: "favorite" | "hide" | "used") {
    await fetch("/api/convo/interaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: card.id, action: act }),
    });
    const map: Record<string, string> = {
      favorite: "convo_card_favorite",
      hide: "convo_card_hide",
      used: "convo_card_used",
    };
    track(map[act], { cardId: card.id });
  }

  async function next() {
    await action("used");
    setShowFollowUps(false);
    setIndex((i) => (i + 1) % cards.length);
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <button
        className="absolute top-2 right-2 p-2"
        aria-label="Close"
        onClick={onClose}
      >
        ✕
      </button>
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <p className="text-xl mb-4">{card.prompt_text}</p>
        {showFollowUps && card.follow_ups.length > 0 && (
          <ul className="text-sm list-disc text-left">
            {card.follow_ups.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
      </div>
      <button
        className="underline mb-4"
        onClick={() => setShowFollowUps((v) => !v)}
        aria-label="Show follow-ups"
      >
        {showFollowUps ? "Hide follow-ups" : "Show follow-ups"}
      </button>
      <div className="p-4 flex justify-center gap-4">
        <button
          aria-label="Favorite"
          className="p-4 text-xl"
          onClick={() => action("favorite")}
        >
          ★
        </button>
        <button
          aria-label="Hide"
          className="p-4 text-xl"
          onClick={() => action("hide")}
        >
          🙈
        </button>
        <button
          aria-label="Next"
          className="p-4 text-xl"
          onClick={next}
        >
          ▶
        </button>
      </div>
    </div>
  );
}

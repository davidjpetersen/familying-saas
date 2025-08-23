import { ConvoCard } from "@/types/convo";

export default function Card({ card }: { card: ConvoCard }) {
  return (
    <div className="border rounded p-4 h-full" aria-label={card.prompt_text}>
      <p className="text-sm">{card.prompt_text}</p>
    </div>
  );
}

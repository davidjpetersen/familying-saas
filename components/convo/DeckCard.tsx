import Link from "next/link";
import { ConvoDeck } from "@/types/convo";

export default function DeckCard({
  deck,
}: {
  deck: ConvoDeck & { card_count: number };
}) {
  return (
    <Link
      href={`/convo/deck/${deck.id}`}
      className="border rounded overflow-hidden block w-60"
      aria-label={`${deck.title} deck`}
    >
      {deck.hero_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={deck.hero_image_url}
          alt=""
          className="w-full h-32 object-cover"
        />
      )}
      <div className="p-2">
        <h3 className="font-semibold">{deck.title}</h3>
        <p className="text-xs text-gray-500">{deck.card_count} cards</p>
      </div>
    </Link>
  );
}

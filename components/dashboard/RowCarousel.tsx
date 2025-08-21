"use client";

import React from "react";
import Card from "@/components/dashboard/Card";

type Item = { id: string; title: string; meta?: string; thumbnail?: string; status?: string };

export default function RowCarousel({ title, items }: { title: string; items: Item[] }) {
  return (
    <section aria-label={title} className="">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button className="text-sm text-muted-foreground">See all</button>
      </div>

      <div className="-ml-3 flex gap-4 overflow-x-auto pb-3 pl-3 snap-x snap-mandatory scrollbar-hide">
        {items.map((it) => (
          <Card key={it.id} item={it} />
        ))}
      </div>
    </section>
  );
}

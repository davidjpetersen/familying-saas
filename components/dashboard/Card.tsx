"use client";

import React from "react";

export default function Card({ item }: { item: { id: string; title: string; meta?: string; thumbnail?: string; status?: string } }) {
  return (
    <article className="w-56 flex-shrink-0 snap-start rounded-2xl bg-card-foreground/5 p-2 transition-transform hover:scale-105 focus-within:scale-105" tabIndex={0} aria-label={`Start ${item.title}`}>
      <div className="overflow-hidden rounded-xl bg-gray-100">
        <div className="aspect-[16/9] bg-gray-200 relative">
          {item.thumbnail && <img src={item.thumbnail} alt={item.title} className="object-cover w-full h-full" />}
          {item.status && (
            <span className="absolute top-2 left-2 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium">{item.status}</span>
          )}
        </div>
      </div>
      <div className="mt-2 px-1">
        <h4 className="text-sm font-semibold leading-tight line-clamp-2">{item.title}</h4>
        {item.meta && <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>}
      </div>
    </article>
  );
}

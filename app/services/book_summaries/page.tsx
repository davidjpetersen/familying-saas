"use client";

import React from 'react';
import Link from 'next/link';

// Temporary gallery with mock thumbnails. Replace with Supabase image fetch later.
const items = Array.from({ length: 8 }).map((_, i) => ({
  id: `book_${i + 1}`,
  title: `Sample Book ${i + 1}`,
  author: `Author ${i + 1}`,
  img: `https://picsum.photos/seed/book${i + 1}/240/320`
}));

export default function GalleryPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Book summaries</h1>
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
        {items.map((it) => (
          <Link key={it.id} href={`/services/book_summaries/${it.id}`} className="group block">
            <div className="aspect-[3/4] w-full overflow-hidden rounded shadow-sm bg-gray-100">
              <img src={it.img} alt={it.title} className="w-full h-full object-cover transform group-hover:scale-105 transition" />
            </div>
            <div className="mt-2 text-sm">
              <div className="font-medium">{it.title}</div>
              <div className="text-muted-foreground text-xs">{it.author}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

"use client";

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ServicesPage() {
  const params = useSearchParams();
  const author = params.get('author');
  const router = useRouter();

  function clearFilter() {
    router.push('/services');
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Services / Summaries</h1>
      {author ? (
        <div className="mb-4">
          <div className="text-sm">Filtering by author:</div>
          <div className="flex items-center gap-2 mt-2">
            <div className="px-3 py-1 rounded bg-muted text-sm">{author}</div>
            <button className="btn btn-ghost btn-sm" onClick={clearFilter}>Clear</button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-6">No author filter applied. Use links from a book page to filter by author.</p>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 border rounded">Placeholder result 1</div>
        <div className="p-4 border rounded">Placeholder result 2</div>
      </div>
    </main>
  );
}

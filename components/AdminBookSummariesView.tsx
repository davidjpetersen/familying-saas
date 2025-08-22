"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SummaryTable from './SummaryTable';

type Summary = any;

export default function AdminBookSummariesView() {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [items, setItems] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/admin/book-summaries')
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;
        setItems(json.data || []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(String(err));
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, []);

  function relativeTime(d?: string) {
    if (!d) return '—';
    const diff = Date.now() - new Date(d).getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h`;
    const days = Math.floor(hr / 24);
    return `${days}d`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('grid')} className={`px-3 py-1 rounded ${view === 'grid' ? 'bg-gray-200' : 'bg-transparent'}`}>Grid</button>
          <button onClick={() => setView('table')} className={`px-3 py-1 rounded ${view === 'table' ? 'bg-gray-200' : 'bg-transparent'}`}>Table</button>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/book-summaries/new" className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded">New Book</Link>
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">{error}</div>}

      {view === 'table' ? (
        <SummaryTable />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.length === 0 && !loading ? (
            <div className="col-span-full text-center text-sm text-muted-foreground">No summaries yet. Create your first summary.</div>
          ) : (
            items.map((it) => (
              <Link key={it.id} href={`/admin/book-summaries/${it.id}`} className="block group border rounded-lg overflow-hidden hover:shadow">
                <div className="h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {it.book?.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.book.cover_url} alt={it.book.title ?? it.id} className="w-full h-full object-cover" />
                  ) : it.document?.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.document.thumbnail} alt={it.document.title ?? it.id} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-xs text-muted-foreground">No image</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-medium text-sm">{it.book?.title ?? it.document?.title ?? it.id}</div>
                  <div className="text-xs text-muted-foreground mt-1">{it.status ?? '—'} · {it.schema_version ?? '—'} · {relativeTime(it.updated_at)}</div>
                  <div className="mt-2 text-xs text-muted-foreground">{String(it.document?.summary ?? '').slice(0, 140)}</div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {(it.tags || []).slice(0,5).map((t: string) => <span key={t} className="px-2 py-1 bg-gray-100 rounded text-xs lowercase">{t}</span>)}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

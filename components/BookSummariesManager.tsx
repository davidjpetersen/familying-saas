"use client"

import * as React from 'react'

function generateId() {
  return `bs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
}

export default function BookSummariesManager() {
  const [items, setItems] = React.useState<any[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [docText, setDocText] = React.useState('');
  const [status, setStatus] = React.useState('published');

  async function fetchItems() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/book-summaries');
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'failed to load');
      setItems(json.data || []);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { fetchItems(); }, []);

  async function createItem() {
    setError(null);
    let doc: any = null;
    try {
      doc = docText ? JSON.parse(docText) : {};
    } catch (err) {
      console.error('Failed to parse document JSON', err);
      setError('Invalid JSON in document');
      return;
    }

    const payload = {
      id: generateId(),
      status,
      book: doc.book ?? null,
      metadata: doc.metadata ?? null,
      tags: Array.isArray(doc.tags) ? doc.tags : [],
      owner: doc.owner ?? null,
      insights: Array.isArray(doc.insights) ? doc.insights : [],
      recommendations: Array.isArray(doc.recommendations) ? doc.recommendations : [],
      document: doc,
    };

    try {
      const res = await fetch('/api/book-summaries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'create failed');
      setDocText('');
      await fetchItems();
    } catch (err: any) {
      setError(String(err?.message ?? err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded bg-background">
        <h3 className="text-lg font-medium">Create summary</h3>
        <p className="text-sm text-muted-foreground mt-1">Paste the summary document JSON or leave empty for a minimal sample.</p>
        <div className="mt-3">
          <label className="text-sm">Status</label>
          <div className="mt-1">
            <select value={status} onChange={e => setStatus(e.target.value)} className="input">
              <option value="published">published</option>
              <option value="draft">draft</option>
              <option value="archived">archived</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="text-sm">Document JSON</label>
          <textarea className="input h-48 w-full font-mono text-xs mt-1" value={docText} onChange={e => setDocText(e.target.value)} placeholder='{"title":"My Book"}' />
        </div>
        <div className="mt-3 flex gap-2">
          <button className="btn" onClick={createItem}>Create</button>
          <button className="btn btn-ghost" onClick={() => setDocText('')}>Clear</button>
        </div>
        {error && <div className="text-sm text-destructive mt-2">{error}</div>}
      </div>

      <div className="p-4 border rounded bg-background">
        <h3 className="text-lg font-medium">Existing summaries</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground mt-2">Loading…</p>
        ) : (
          <div className="mt-2 space-y-3">
            {items && items.length === 0 && <p className="text-sm text-muted-foreground">No summaries found.</p>}
            {items?.map((it: any) => (
              <div key={it.id} className="p-3 border rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{it?.book?.title ?? (it.document?.title ?? it.id)}</div>
                    <div className="text-xs text-muted-foreground">{it.id} · {new Date(it.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{it.status}</div>
                </div>
                {it.document?.summary && <div className="mt-2 text-sm">{String(it.document.summary).slice(0, 300)}{String(it.document.summary).length > 300 ? '…' : ''}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

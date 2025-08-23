"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { listBookSummaries, bulkDeleteBookSummaries } from "../lib/supabase/bookSummaries";

type Row = any;

export default function SummaryTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      const qp = new URLSearchParams();
      qp.set('page', String(page));
      qp.set('pageSize', String(25));
      if (search) qp.set('search', search);
      if (statusFilter) qp.set('status', statusFilter);
      const res = await fetch(`/api/admin/book-summaries?${qp.toString()}`);
      if (!res.ok) return;
      const { data, count } = await res.json();
      if (mounted) {
        setRows(data);
        setTotal(count || 0);
      }
    }
    load();
    return () => { mounted = false };
  }, [page, search, statusFilter]);

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  function relativeTime(d: Date) {
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h`;
    const days = Math.floor(hr / 24);
    return `${days}d`;
  }

  const bulkDelete = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} summaries? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/book-summaries/bulk-delete`, { method: "POST", body: JSON.stringify({ ids }) });
    if (res.ok) {
      setRows((r) => r.filter((row) => !ids.includes(row.id)));
      setSelected({});
      alert("Deleted");
    } else {
      alert("Delete failed");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search title or owner" className="border px-2 py-1 rounded" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="border px-2 py-1 rounded">
            <option value="">All status</option>
            <option value="draft">draft</option>
            <option value="in_review">in_review</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </div>
        <div>
          <Link href="/admin/book-summaries/new" className="btn">New Summary</Link>
          <button onClick={bulkDelete} className="ml-2 btn">Delete selected</button>
        </div>
      </div>

      <table className="w-full table-auto">
        <thead>
          <tr>
            <th></th>
            <th>Title</th>
            <th>Status</th>
            <th>Tags</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td><input type="checkbox" checked={!!selected[r.id]} onChange={() => toggle(r.id)} /></td>
              <td>{r.book?.title ?? r.document?.title ?? r.id}</td>
              <td>{r.status}</td>
              <td className="max-w-xs truncate text-sm text-muted-foreground">{r.tags ?? '—'}</td>
              <td>{r.updated_at ? relativeTime(new Date(r.updated_at)) : '—'}</td>
              <td><Link href={`/admin/book-summaries/${r.id}`} className="text-blue-500">Edit</Link></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between">
        <div>Showing {rows.length} of {total}</div>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn">Prev</button>
          <button onClick={() => setPage((p) => p + 1)} className="btn">Next</button>
        </div>
      </div>
    </div>
  );
}

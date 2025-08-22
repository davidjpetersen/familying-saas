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

  useEffect(() => {
    let mounted = true;
    async function load() {
      const res = await fetch(`/api/admin/book-summaries?page=${page}`);
      if (!res.ok) return;
      const { data, count } = await res.json();
      if (mounted) {
        setRows(data);
        setTotal(count || 0);
      }
    }
    load();
    return () => { mounted = false };
  }, [page]);

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

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
          <input placeholder="Search" className="border px-2 py-1 rounded" />
          <select className="border px-2 py-1 rounded">
            <option value="">All status</option>
            <option value="draft">draft</option>
            <option value="review">review</option>
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
            <th>Status</th>
            <th>Schema</th>
            <th>Owner</th>
            <th>Tags</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td><input type="checkbox" checked={!!selected[r.id]} onChange={() => toggle(r.id)} /></td>
              <td>{r.status}</td>
              <td>{r.schema_version}</td>
              <td>{r.owner}</td>
              <td>{(r.tags || []).map((t: string) => <span key={t} className="px-2 py-1 mr-1 bg-gray-100 rounded text-sm">{t}</span>)}</td>
              <td>{new Date(r.updated_at).toLocaleString()}</td>
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

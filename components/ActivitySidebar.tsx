"use client";
import React, { useEffect, useState } from "react";

type Activity = {
  id: string;
  summary_id: string;
  user_id: string;
  action: string;
  changes: unknown;
  created_at: string;
};

export default function ActivitySidebar({ summaryId }: { summaryId?: string }) {
  const [items, setItems] = useState<Activity[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`/api/admin/book_summaries/book-summaries/${summaryId ?? "_all"}/activity`);
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setItems(data.slice(0, 10));
      } catch (e) {
        console.error('Failed to load activity', e);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [summaryId]);

  return (
    <aside className="w-80 border-l pl-4">
      <h3 className="font-semibold mb-2">Recent changes</h3>
      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No recent activity</div>
        ) : (
          items.map((it) => (
            <div key={it.id} className="text-sm border rounded p-2">
              <div className="text-xs text-muted-foreground">{new Date(it.created_at).toLocaleString()}</div>
              <div className="font-medium">{it.action} by {it.user_id}</div>
              <pre className="text-xs mt-1 max-h-24 overflow-auto">{JSON.stringify(it.changes, null, 2)}</pre>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

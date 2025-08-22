"use client";

import { useEffect, useState } from "react";

type AdminRow = {
  id: string;
  clerk_user_id?: string | null;
  email?: string | null;
  created_at?: string;
};

export default function AdminManager() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newClerkId, setNewClerkId] = useState("");

  async function fetchAdmins() {
    setLoading(true);
    setError(null);
    setForbidden(false);
    try {
      const res = await fetch('/api/admin/list');
      const payload = await res.json();
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      if (!res.ok) throw new Error(payload?.error || 'failed to load');
      setAdmins(payload.data || []);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAdmins(); }, []);

  async function manage(action: 'add'|'remove', payload: { clerk_user_id?: string; email?: string }) {
    setError(null);
    try {
      const res = await fetch('/api/admin/manage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, ...payload }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'manage failed');
      await fetchAdmins();
    } catch (err: any) {
      setError(String(err?.message ?? err));
    }
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium">Admin management</h2>

      <div className="mt-3 space-y-4">
        {forbidden ? (
          <div className="p-4 border rounded bg-background">
            <p className="text-sm text-muted-foreground">You are not authorized to manage admins.</p>
          </div>
        ) : (
          <div className="p-4 border rounded bg-background">
          <p className="text-sm text-muted-foreground">Add a new admin by Clerk user id or email.</p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input className="input" placeholder="Clerk user id (user_...)" value={newClerkId} onChange={e => setNewClerkId(e.target.value)} />
            <input className="input" placeholder="Email (someone@example.com)" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button className="btn" onClick={() => manage('add', { clerk_user_id: newClerkId || undefined, email: newEmail || undefined })}>Add admin</button>
            <button className="btn btn-ghost" onClick={() => { setNewClerkId(''); setNewEmail(''); }}>Clear</button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Note: server-side will validate your identity before allowing changes.</p>
          </div>
        )}

        <div className="p-4 border rounded bg-background">
          <h3 className="font-medium">Current admins</h3>
          {loading ? (
            <p className="text-sm text-muted-foreground mt-2">Loading…</p>
          ) : (
            <div className="mt-2 space-y-2">
              {admins.length === 0 && <p className="text-sm text-muted-foreground">No admins found.</p>}
              {admins.map(a => (
                <div key={a.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="text-sm font-medium">{a.email ?? a.clerk_user_id ?? a.id}</div>
                    <div className="text-xs text-muted-foreground">{a.clerk_user_id ? `clerk:${a.clerk_user_id}` : ''}{a.email ? ` · ${a.email}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn btn-sm btn-outline" onClick={() => { if (confirm('Remove admin?')) manage('remove', { clerk_user_id: a.clerk_user_id ?? undefined, email: a.email ?? undefined }); }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}
      </div>
    </div>
  );
}

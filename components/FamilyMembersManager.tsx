"use client";

import React, { useEffect, useState } from "react";

type Member = {
  id: string;
  display_name: string;
  type: string;
  birthdate?: string | null;
  created_at?: string | null;
};

export default function FamilyMembersManager() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"adult" | "child">("adult");
  const [birthdate, setBirthdate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/family-members");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMembers(data || []);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/family-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: name, type, birthdate: birthdate || null }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
      }
      setName("");
      setBirthdate("");
      await load();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    }
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold">Family Members</h3>
      <p className="text-xs text-muted-foreground mb-3">Manage people in your family.</p>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <ul className="space-y-2 mb-3">
          {members?.map((m) => (
            <li key={m.id} className="flex justify-between items-center">
              <div>
                <div className="font-medium">{m.display_name}</div>
                <div className="text-xs text-muted-foreground">
                  {m.type} • {m.birthdate ?? "—"}
                </div>
              </div>
            </li>
          ))}
          {members && members.length === 0 && (
            <li className="text-sm text-muted-foreground">No members yet.</li>
          )}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex flex-col gap-2">
        <input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded border px-2 py-1"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="w-full rounded border px-2 py-1"
        >
          <option value="adult">Adult</option>
          <option value="child">Child</option>
        </select>
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="w-full rounded border px-2 py-1"
        />
        <div className="flex gap-2">
          <button type="submit" className="rounded bg-primary px-3 py-1 text-white">
            Add member
          </button>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
      </form>
    </div>
  );
}

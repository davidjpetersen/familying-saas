"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { zSummary } from "../lib/zSummary";
import JsonField from "./JsonField";
import TagInput from "./TagInput";

type Props = {
  initial?: any;
  id?: string;
  onSaved?: (row: any) => void;
};

export default function SummaryForm({ initial, id, onSaved }: Props) {
  const { register, handleSubmit, setValue, watch, formState } = useForm({ resolver: zodResolver(zSummary), defaultValues: initial || {} });
  const [docText, setDocText] = useState(JSON.stringify(initial?.document ?? {}, null, 2));
  const [bookText, setBookText] = useState(JSON.stringify(initial?.book ?? {}, null, 2));
  const [metaText, setMetaText] = useState(JSON.stringify(initial?.metadata ?? {}, null, 2));

  useEffect(() => {
    register("document");
    register("book");
    register("metadata");
  }, [register]);

  const onSubmit = async (data: any) => {
    try {
      const payload = { ...data, document: JSON.parse(docText || "{}"), book: JSON.parse(bookText || "{}"), metadata: JSON.parse(metaText || "{}") };
      const res = await fetch(id ? `/api/admin/book-summaries/${id}` : `/api/admin/book-summaries`, { method: id ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json();
      onSaved?.(saved);
      alert("Saved");
    } catch (e) {
      alert(String(e));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm">Schema version</label>
          <input {...register("schema_version")} className="border w-full px-2 py-1 rounded" />
        </div>
        <div>
          <label className="block text-sm">Status</label>
          <select {...register("status")} className="border w-full px-2 py-1 rounded">
            <option value="draft">draft</option>
            <option value="review">review</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm">Owner</label>
        <input {...register("owner")} className="border w-full px-2 py-1 rounded" />
      </div>

      <div>
        <label className="block text-sm">Tags</label>
        <TagInput value={initial?.tags ?? []} onChange={(v) => setValue("tags", v)} />
      </div>

      <div>
        <label className="block text-sm">Document</label>
        <JsonField value={docText} onChange={setDocText} height={240} />
      </div>

      <div>
        <label className="block text-sm">Book</label>
        <JsonField value={bookText} onChange={setBookText} height={160} />
      </div>

      <div>
        <label className="block text-sm">Metadata</label>
        <JsonField value={metaText} onChange={setMetaText} height={120} />
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn">Save</button>
        <button type="button" onClick={() => alert('Save & Publish not implemented in scaffold')} className="btn">Save & Publish</button>
        <button type="button" onClick={() => alert('Duplicate not implemented in scaffold')} className="btn">Duplicate</button>
        {id && <button type="button" onClick={() => { if (confirm('Delete?')) { fetch(`/api/admin/book-summaries/${id}`, { method: 'DELETE' }).then(() => { alert('Deleted'); location.href = '/admin/book-summaries' }) } }} className="btn">Delete</button>}
      </div>
    </form>
  );
}

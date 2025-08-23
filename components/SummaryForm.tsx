"use client";
import React, { useEffect, useMemo, useState } from "react";
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
  const { register, handleSubmit, setValue, watch } = useForm({
    resolver: zodResolver(zSummary),
    defaultValues: {
      ...(initial || {}),
      book_title: initial?.book?.title ?? "",
      book_subtitle: initial?.book?.subtitle ?? "",
    } as any,
  });
  const [docText, setDocText] = useState(JSON.stringify(initial?.document ?? {}, null, 2));
  const [bookText, setBookText] = useState(JSON.stringify(initial?.book ?? {}, null, 2));
  const [metaText, setMetaText] = useState(JSON.stringify(initial?.metadata ?? {}, null, 2));
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    register("document");
    register("book");
    register("metadata");
  }, [register]);

  const onSubmit = async (data: any) => {
    try {
      const document = JSON.parse(docText || "{}");
      const book = JSON.parse(bookText || "{}");
      if (data.book_title !== undefined) book.title = data.book_title;
      if (data.book_subtitle !== undefined) book.subtitle = data.book_subtitle;
      const metadata = JSON.parse(metaText || "{}");
      const { book_title, book_subtitle, ...rest } = data;
      const payload = { ...rest, document, book, metadata };
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{id ? 'Edit Summary' : 'New Summary'}</h1>
          <p className="text-sm text-muted-foreground mt-1">Provide a clear title and optional subtitle; add content below.</p>
        </div>
        <div className="flex gap-2">
          {id && (
            <button type="button" onClick={() => { if (confirm('Delete?')) { fetch(`/api/admin/book-summaries/${id}`, { method: 'DELETE' }).then(() => { alert('Deleted'); location.href = '/admin/book-summaries' }) } }} className="btn btn-outline">Delete</button>
          )}
          <button type="submit" className="btn">Save</button>
        </div>
      </div>

      {/* Find book */}
      <section className="p-4 border rounded bg-background space-y-4">
        <h2 className="text-lg font-semibold">Find book</h2>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border w-full px-2 py-1 rounded"
            placeholder="Search by title, author, or paste an ISBN"
          />
          <button
            type="button"
            disabled={searching || !searchQuery.trim()}
            onClick={async () => {
              try {
                setErrorMsg(null);
                setSearching(true);
                setResults([]);
                const q = searchQuery.trim();
                // crude ISBN detection: 10 or 13 digits, possibly with dashes/spaces
                const cleaned = q.replace(/[^0-9Xx]/g, "");
                const isIsbn = /^[0-9Xx]{10}$/.test(cleaned) || /^[0-9]{13}$/.test(cleaned);
                const url = isIsbn ? `/api/books/lookup?isbn=${encodeURIComponent(cleaned)}` : `/api/books/lookup?q=${encodeURIComponent(q)}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Search failed (${res.status})`);
                const json = await res.json();
                setResults(Array.isArray(json?.data) ? json.data : []);
              } catch (e: any) {
                setErrorMsg(String(e?.message || e));
              } finally {
                setSearching(false);
              }
            }}
            className="btn md:w-32"
          >
            {searching ? 'Searching…' : 'Search'}
          </button>
        </div>
        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
        {results.length > 0 && (
          <div className="mt-3 grid gap-3">
            {results.map((b: any, idx: number) => (
              <div key={`${b.source}:${b.sourceId}:${idx}`} className="flex items-start gap-3 p-3 border rounded">
                {b.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.thumbnail} alt={b.title} className="w-14 h-20 object-cover rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{b.title}</div>
                  {b.subtitle && <div className="text-sm text-muted-foreground truncate">{b.subtitle}</div>}
                  <div className="text-sm text-muted-foreground truncate">{Array.isArray(b.authors) ? b.authors.join(', ') : ''}</div>
                  <div className="text-xs text-muted-foreground mt-1">{b.publishedDate || ''} · {b.language || ''} · {b.pageCount ? `${b.pageCount} pages` : ''}</div>
                </div>
                <div className="flex flex-col gap-2">
                  {b.previewUrl && <a href={b.previewUrl} target="_blank" rel="noreferrer" className="btn btn-outline">Preview</a>}
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      // Prefill core fields
                      setValue('book_title', b.title || '');
                      setValue('book_subtitle', b.subtitle || '');
                      setValue('publication_date', b.publishedDate || null as any);
                      if (b.pageCount) setValue('page_count', b.pageCount as any);
                      if (b.language) setValue('language_code', String(b.language).slice(0,2));
                      const isbn13 = b.identifiers?.find((i: any) => String(i.type).toUpperCase().includes('13'))?.value;
                      const isbn10 = b.identifiers?.find((i: any) => String(i.type).toUpperCase().includes('10'))?.value;
                      if (isbn10) setValue('isbn_10', isbn10);
                      if (isbn13) setValue('isbn_13', isbn13);
                      if (b.previewUrl) setValue('canonical_url', b.previewUrl);

                      // Update advanced JSON blobs
                      const bookObj = {
                        title: b.title,
                        subtitle: b.subtitle ?? null,
                        authors: b.authors ?? [],
                        identifiers: b.identifiers ?? [],
                        language: b.language ?? null,
                        categories: b.categories ?? [],
                        publishedDate: b.publishedDate ?? null,
                        pageCount: b.pageCount ?? null,
                        thumbnail: b.thumbnail ?? null,
                        previewUrl: b.previewUrl ?? null,
                        source: b.source,
                        sourceId: b.sourceId,
                        description: b.description ?? null,
                      };
                      setBookText(JSON.stringify(bookObj, null, 2));
                      setMetaText(JSON.stringify({ selectedBook: bookObj }, null, 2));
                    }}
                  >
                    Use
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Basic info */}
      <section className="p-4 border rounded bg-background space-y-4">
        <h2 className="text-lg font-semibold">Basic info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Title</label>
            <input {...register("book_title")} className="border w-full px-2 py-1 rounded" placeholder="Book title" />
          </div>
          <div>
            <label className="block text-sm">Subtitle</label>
            <input {...register("book_subtitle")} className="border w-full px-2 py-1 rounded" placeholder="Subtitle (optional)" />
          </div>
          <div>
            <label className="block text-sm">Status</label>
            <select {...register("status")} className="border w-full px-2 py-1 rounded">
              <option value="draft">draft</option>
              <option value="in_review">in_review</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Owner</label>
            <input {...register("owner")} className="border w-full px-2 py-1 rounded" placeholder="owner identifier (optional)" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm">Tags</label>
            <TagInput value={initial?.tags ?? []} onChange={(v) => setValue("tags", v)} />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="p-4 border rounded bg-background space-y-4">
        <h2 className="text-lg font-semibold">Content</h2>
        <div>
          <label className="block text-sm">Document</label>
          <JsonField value={docText} onChange={setDocText} height={240} />
        </div>
        <div>
          <label className="block text-sm">Book (advanced)</label>
          <JsonField value={bookText} onChange={setBookText} height={160} />
        </div>
        <div>
          <label className="block text-sm">Metadata (advanced)</label>
          <JsonField value={metaText} onChange={setMetaText} height={120} />
        </div>
      </section>

      {/* Assets & moderation */}
      <section className="p-4 border rounded bg-background space-y-4">
        <h2 className="text-lg font-semibold">Assets & moderation</h2>
        <div>
          <label className="block text-sm">Cover image path</label>
          <input {...register("cover_image_path")} className="border w-full px-2 py-1 rounded" />
        </div>
        <div>
          <label className="block text-sm">Moderation notes</label>
          <textarea {...register("moderation_notes")} className="border w-full px-2 py-1 rounded" rows={3} />
        </div>
      </section>
    </form>
  );
}

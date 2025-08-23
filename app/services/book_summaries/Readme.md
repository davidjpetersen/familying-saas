# Vectorized Book Summaries — Simplified, End-to-End Spec
_This spec applies the “ruthless simplifications” while preserving the vectorized backend. It includes DB schema, RLS, workers, API contracts, public + admin UI, rendering, payload format, caching, and acceptance criteria._

---

## 0) Guiding Principles
- **Thin slice**: MVP focuses on ingest → chunk → embed → **PDF + payload** render → beautiful public pages.
- **One payload**: Public summary page loads a **single versioned JSON** blob + optional PDF URL.
- **Vectors retained**: pgvector for future semantic search; start with IVFFlat (or even metadata + lexical) for MVP.
- **Versioning**: every publish increments `render_version`; asset and payload paths contain the version to auto-bust caches.
- **Security**: RLS by owner for admin; public only serves `is_published=true`.

---

## 1) Environment & Tech
- **DB**: Postgres (Supabase), extensions: `pgcrypto`, `vector`.
- **Storage**: Supabase buckets: `books/raw/`, `books/covers/`, `summaries/assets/`, `summaries/payloads/`.
- **Backend**: Next.js (App Router) API routes (Node 18+), TypeScript.
- **Workers**: queue-backed (e.g., QStash/Resend, Supabase Functions, or a lightweight worker on Vercel CRON).
- **Frontend**: Next.js + Tailwind + shadcn/ui; accessible, responsive.
- **Embeddings**: configurable (e.g., `text-embedding-3-large`, dim **3072**). Query embedding computed server-side.

---

## 2) Database Schema (SQL Migration)
> Keep `books` / `book_chunks` for vectorized text. Simplify summaries and inline affiliate links for MVP.

```sql
-- Enable required extensions
create extension if not exists pgcrypto;
create extension if not exists vector;

-- USERS table assumed to exist elsewhere; RLS uses auth.uid() mapping in Supabase

-- BOOKS: core catalog
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null,
  slug text generated always as (
    lower(regexp_replace(coalesce(title,''), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(id::text,1,8)
  ) stored,
  title text not null,
  subtitle text,
  authors text[] default '{}',
  lang text default 'en',
  cover_uri text,                         -- supabase://books/covers/...
  source_uri text,                        -- supabase://books/raw/...
  affiliate_links jsonb default '[]',     -- [{vendor, label, url}]
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists books_owner_idx on public.books(owner_user_id);
create index if not exists books_slug_idx on public.books(slug);

-- CHUNKS: vectorized text segments (admin/ops only; not hit by public pages)
-- Choose vector dimension to match embedding model (e.g., 3072).
create table if not exists public.book_chunks (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  owner_user_id uuid not null,
  chunk_index int not null,
  heading_path text[] default '{}',       -- e.g., ["Part I","Ch. 3","2.1"]
  start_char int not null,
  end_char int not null,
  text text not null,
  chunk_fingerprint text not null unique, -- SHA256(book_id + path + normalized_text)
  embedding vector(3072),
  embedding_model text not null default 'text-embedding-3-large',
  embedding_version text not null default 'v1',
  normalizer_version text not null default 'v1',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists book_chunks_book_idx on public.book_chunks(book_id, chunk_index);
create index if not exists book_chunks_owner_idx on public.book_chunks(owner_user_id);

-- Vector ANN: start with IVFFlat for MVP; tune lists based on corpus size.
-- (If you have pgvector >= 0.7 and HNSW available, switch to HNSW.)
create index if not exists book_chunks_embed_ivf
  on public.book_chunks using ivfflat (embedding vector_cosine_ops) with (lists=100);

-- SUMMARIES: curated editorial layer + publish control + payload linkage
create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  owner_user_id uuid not null,
  is_published boolean default false,
  render_version int default 1,           -- bump on publish/render
  payload_uri text,                       -- supabase://summaries/payloads/{id}/v{render_version}/payload.json
  pdf_uri text,                           -- supabase://summaries/assets/{id}/v{render_version}/summary.pdf
  title text,                             -- defaults to book.title if null (client can fall back)
  subtitle text,
  overview text,                          -- 1–3 paragraphs
  key_insights jsonb default '[]',        -- [{title, detail}]
  chapter_summaries jsonb default '[]',   -- [{chapter, title, bullets:[...]}]
  tags text[] default '{}',
  updated_at timestamptz default now(),
  created_at timestamptz default now(),
  unique (book_id)
);

create index if not exists summaries_owner_idx on public.summaries(owner_user_id);
create index if not exists summaries_publish_idx on public.summaries(is_published);

-- -------------------
-- Row-Level Security
-- -------------------
alter table public.books enable row level security;
alter table public.book_chunks enable row level security;
alter table public.summaries enable row level security;

-- Admin/Owner policies
create policy "books_owner_read" on public.books
  for select using (owner_user_id = auth.uid());
create policy "books_owner_write" on public.books
  for insert with check (owner_user_id = auth.uid())
  using (owner_user_id = auth.uid());

create policy "chunks_owner_read" on public.book_chunks
  for select using (owner_user_id = auth.uid());
create policy "chunks_owner_write" on public.book_chunks
  for insert with check (owner_user_id = auth.uid())
  using (owner_user_id = auth.uid());

create policy "summaries_owner_read" on public.summaries
  for select using (owner_user_id = auth.uid());
create policy "summaries_owner_write" on public.summaries
  for insert with check (owner_user_id = auth.uid())
  using (owner_user_id = auth.uid());

-- Public read policy for published summaries (read-only)
create policy "summaries_public_read_published" on public.summaries
  for select using (is_published = true);

-- Optional: make published books discoverable (titles/covers only) if they belong to a published summary
-- Otherwise keep books owner-only and serve library via API that joins internally without exposing raw tables.


⸻

3) Workers & Pipelines

3.1 Ingest Worker (idempotent)
	•	Input: { book_id, owner_user_id, source_uri }
	•	Steps:
	1.	Fetch original text (PDF → text, EPUB → text).
	2.	Normalize (unicode NFKC, trim whitespace).
	3.	Chunk deterministically (target 900–1,200 tokens, 10–15% overlap).
	4.	Compute chunk_fingerprint and upsert rows (without embeddings).
	5.	Enqueue Embed jobs for the new or stale chunks.

3.2 Embed Worker
	•	Input: { book_id } or { chunk_id }
	•	Steps:
	1.	Select chunks where embedding is null or embedding_version != CURRENT_VERSION.
	2.	Compute embedding with configured model.
	3.	Update embedding, embedding_version, updated_at.
	•	Retry: exponential backoff; safe to re-run due to idempotent fingerprints.

3.3 Render Worker (Payload + PDF)
	•	Triggered by: publish action or explicit render.
	•	Input: { summary_id }
	•	Steps:
	1.	Read books + summaries rows.
	2.	Build payload JSON (see §6) and write to:
supabase://summaries/payloads/{summary_id}/v{render_version}/payload.json
	3.	Render PDF (headless Chromium or Node renderer) using the payload content and print CSS.
	4.	Save PDF to:
supabase://summaries/assets/{summary_id}/v{render_version}/summary.pdf
	5.	Update summaries.payload_uri and summaries.pdf_uri.

Audio: Deferred. When added, write to /assets/{summary_id}/v{render_version}/summary.mp3 and include audio_url in payload.

⸻

4) API Contracts (MVP)

Admin APIs (auth required)
	•	POST /admin/books/:id/ingest
	•	Body: { source_uri?: string } (falls back to row value)
	•	202 Accepted → { job_id }
	•	POST /admin/books/:id/embed
	•	Enqueue embedding for all chunks of the book.
	•	202 Accepted → { job_id }
	•	PATCH /admin/summaries/:id
	•	Body (partial): { title?, subtitle?, overview?, key_insights?, chapter_summaries?, tags?, is_published? }
	•	200 → updated row
	•	POST /admin/summaries/:id/render
	•	Increments render_version iff is_published=true, generates payload + PDF.
	•	202 Accepted → { job_id, next_render_version }

Public APIs
	•	GET /api/library?tag=&page=&pageSize=
	•	200 → [ { id, slug, title, authors, cover_url, tags } ] (server aggregates from books + summaries where is_published=true)
	•	GET /api/books/:slug/summary
	•	200 → proxy/redirect to payload_uri or server-side fetch → returns payload JSON (see §6).
	•	404 if not published.
	•	GET /api/summaries/:id/download.pdf
	•	302 redirect to signed URL for pdf_uri (or 404 if not ready).
	•	POST /api/summaries/:id/share
	•	200 → { share_url, og_image_url }

⸻

5) Frontend UX

5.1 Public Library (Gallery)
	•	Route: /
	•	Layout: Hero + horizontal row sections (Netflix-style).
	•	Rows: “New & Noteworthy”, “Editor’s Picks”, “By Tag: Sleep”, etc.
	•	Card: cover, title, authors, tag chips; hover: “Open Summary”.
	•	Search: start lexical; add vector hybrid later (reuses chunk embeddings).

Key Components:
	•	LibraryHero, RowSection, BookCard, SearchBar, TagChips.

5.2 Public Summary (3-Column)
	•	Route: /book/:slug
	•	Data: fetch one payload JSON; hydrate page.
	•	Grid: grid-cols-[220px,1fr,280px] on lg+, stacked on mobile.

Left (Scrollspy/TOC):
	•	Anchors: Overview, Key Insights, Chapters (per chapter).
	•	Sticky; collapsible on mobile.

Center (Main):
	•	Header with title, authors, cover thumb, last updated.
	•	Overview (1–3 short paragraphs).
	•	Key Insights (numbered list; expandable details).
	•	Chapter Summaries (accordion per chapter).
	•	“Back to top” anchors.

Right (Sidebar):
	1.	Actions (stacked full-width):
	•	“Download PDF” (enabled if pdf_url exists; else disabled with tooltip “Rendering”).
	•	“Share” (copies share_url or opens modal).
	•	(Audio optional later: show if audio_url present; otherwise hidden.)
	2.	Buy the Book (affiliate buttons):
	•	ThriftBooks, Amazon, Google Books, Bookshop (rel="sponsored nofollow").
	3.	Tags & Metadata:
	•	Tag chips → link back to filtered Library.
	•	Reading time estimate, language, last updated.

Key Components:
	•	ScrollspyNav, SummaryHeader, KeyInsightsList, ChapterAccordion,
SidebarActions, AffiliateBlock, TagList.

5.3 Admin
	•	/admin/books (list, create/import)
	•	/admin/books/:id (metadata, cover upload, source, affiliate JSON editor, ingest/embed status)
	•	/admin/summaries (list, filter by publish status)
	•	/admin/summaries/:id (editor: overview, 3–7 insights, optional chapter bullets; tags; publish toggle; Render button)

⸻

6) Public Payload Format (Versioned JSON)

Keep payload < ~250 KB. Include explicit payload_version to manage drift.

{
  "payload_version": 1,
  "render_version": 3,
  "book": {
    "id": "UUID",
    "slug": "atomic-habits-1234abcd",
    "title": "Atomic Habits",
    "subtitle": null,
    "authors": ["James Clear"],
    "lang": "en",
    "cover_url": "https://cdn.example.com/books/covers/atomic@2x.jpg",
    "affiliate_links": [
      {"vendor":"thriftbooks","label":"ThriftBooks","url":"https://..."},
      {"vendor":"amazon","label":"Amazon","url":"https://..."},
      {"vendor":"google","label":"Google Books","url":"https://..."}
    ]
  },
  "summary": {
    "title": "Atomic Habits",
    "subtitle": null,
    "overview": "Concise 1–3 paragraphs...",
    "key_insights": [
      {"title":"Habit stacking","detail":"..."},
      {"title":"Make it obvious","detail":"..."}
    ],
    "chapter_summaries": [
      {"chapter": 1, "title": "The Fundamentals", "bullets": ["...", "..."]},
      {"chapter": 2, "title": "Make It Obvious", "bullets": ["...", "..."]}
    ],
    "tags": ["habits","behavior-change"],
    "updated_at": "2025-08-22T10:00:00Z"
  },
  "assets": {
    "pdf_url": "https://cdn.example.com/summaries/assets/{summary_id}/v3/summary.pdf",
    "audio_url": null
  },
  "share": {
    "share_url": "https://app.example.com/s/atomic-habits-1234abcd"
  }
}


⸻

7) Rendering Details

7.1 PDF
	•	Input: payload JSON.
	•	Engine: headless Chromium (Playwright) with a print CSS template.
	•	Style: clean serif for body, sans for headings, auto TOC from anchors, page numbers, widows/orphans control.
	•	Output path: summaries/assets/{summary_id}/v{render_version}/summary.pdf.

7.2 Payload
	•	Input: DB rows (books + summaries).
	•	Output path: summaries/payloads/{summary_id}/v{render_version}/payload.json.
	•	Validation: ensure at least 3 key insights before publish/render.

⸻

8) Caching, Performance & SEO
	•	ISR: Library and Summary pages pre-render with ISR; revalidate on publish or render complete webhook.
	•	CDN: payload.json + PDF behind CDN; cache-control public, long TTL (versioned URLs).
	•	Images: next/image with AVIF/WebP; multiple sizes.
	•	SEO: JSON-LD Book; dynamic OG image using title, cover, tags.

⸻

9) Search (MVP → Later)
	•	MVP: simple lexical search over published books.title, authors, and summary.tags.
	•	Later: hybrid search—embed user query, run cosine similarity over book_chunks filtered by published book_ids, map to books.

Example cosine query (server-side; pass query vector as parameter):

with q as (select $1::vector(3072) as qvec)
select c.book_id, min(c.chunk_index) as first_hit,
       1 - (c.embedding <=> q.qvec) as score
from public.book_chunks c, q
join public.summaries s on s.book_id = c.book_id and s.is_published = true
group by c.book_id, q.qvec
order by c.embedding <=> q.qvec
limit 10;


⸻

10) Acceptance Criteria

Library
	•	Renders hero + at least 3 horizontal rows; p95 TTI < 1.2s on desktop broadband.
	•	Search returns relevant titles/tags within 200ms (cached).

Summary
	•	Single payload fetch; scrollspy accurately tracks sections.
	•	Right-rail: PDF button enabled when pdf_url exists; Share copies a short URL.
	•	Tags link back to filtered Library view.

Admin
	•	Cannot publish unless: overview present AND between 3 and 7 key_insights.
	•	Render button produces new payload_uri + pdf_uri; public page reflects render_version on refresh.

Data
	•	Deterministic chunk counts across re-ingests.
	•	IVFFlat index exists; ANALYZE performed after bulk writes.

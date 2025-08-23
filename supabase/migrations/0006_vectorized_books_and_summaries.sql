-- Enable required extensions
create extension if not exists pgcrypto;
create extension if not exists vector;

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
  cover_uri text,
  source_uri text,
  affiliate_links jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists books_owner_idx on public.books(owner_user_id);
create index if not exists books_slug_idx on public.books(slug);

-- CHUNKS: vectorized text segments
create table if not exists public.book_chunks (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  owner_user_id uuid not null,
  chunk_index int not null,
  heading_path text[] default '{}',
  start_char int not null,
  end_char int not null,
  text text not null,
  chunk_fingerprint text not null unique,
  embedding vector(3072),
  embedding_model text not null default 'text-embedding-3-large',
  embedding_version text not null default 'v1',
  normalizer_version text not null default 'v1',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists book_chunks_book_idx on public.book_chunks(book_id, chunk_index);
create index if not exists book_chunks_owner_idx on public.book_chunks(owner_user_id);
drop index if exists book_chunks_embed_ivf;
-- Skipping ANN index on public.book_chunks(embedding) due to pgvector <=2000 dimension limit.
-- Options to enable ANN later:
--  - Upgrade the pgvector extension to a version/build that supports 3072-D ANN indexes, then:
--      create index if not exists book_chunks_embed_hnsw on public.book_chunks using hnsw (embedding vector_cosine_ops);
--  - Or switch to 1536-D embeddings and use IVFFlat/HNSW accordingly.

-- SUMMARIES: curated editorial layer
create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  owner_user_id uuid not null,
  is_published boolean default false,
  render_version int default 1,
  payload_uri text,
  pdf_uri text,
  title text,
  subtitle text,
  overview text,
  key_insights jsonb default '[]',
  chapter_summaries jsonb default '[]',
  tags text[] default '{}',
  updated_at timestamptz default now(),
  created_at timestamptz default now(),
  unique (book_id)
);

create index if not exists summaries_owner_idx on public.summaries(owner_user_id);
create index if not exists summaries_publish_idx on public.summaries(is_published);

-- RLS
alter table public.books enable row level security;
alter table public.book_chunks enable row level security;
alter table public.summaries enable row level security;

-- Policies: drop-if-exists then create (avoids unsupported IF NOT EXISTS)
drop policy if exists books_owner_read on public.books;
drop policy if exists books_owner_write on public.books;

drop policy if exists chunks_owner_read on public.book_chunks;
drop policy if exists chunks_owner_write on public.book_chunks;

drop policy if exists summaries_owner_read on public.summaries;
drop policy if exists summaries_owner_write on public.summaries;
drop policy if exists summaries_public_read_published on public.summaries;

create policy books_owner_read on public.books
  for select
  using (owner_user_id = auth.uid());

create policy books_owner_write on public.books
  for insert
  with check (owner_user_id = auth.uid());

create policy chunks_owner_read on public.book_chunks
  for select
  using (owner_user_id = auth.uid());

create policy chunks_owner_write on public.book_chunks
  for insert
  with check (owner_user_id = auth.uid());

create policy summaries_owner_read on public.summaries
  for select
  using (owner_user_id = auth.uid());

create policy summaries_owner_write on public.summaries
  for insert
  with check (owner_user_id = auth.uid());

create policy summaries_public_read_published on public.summaries
  for select
  using (is_published = true);

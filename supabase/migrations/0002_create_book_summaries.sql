-- Migration: create book_summaries table to store JSON schema-based book summaries
-- This table stores the full document in a jsonb column for flexibility,
-- plus a few indexed columns for querying.

create table if not exists public.book_summaries (
  id text primary key,
  document jsonb not null,
  schema_version text not null,
  status text not null check (status in ('draft','final')),
  book jsonb,
  metadata jsonb,

  -- columns added later in 0005, included here so initial create matches final shape
  slug text,
  external_ids jsonb,
  isbn_10 text,
  isbn_13 text,
  canonical_url text,
  publisher text,
  publication_date date,
  edition text,
  language_code text,
  page_count int,
  series_name text,
  series_number numeric,
  toc jsonb,
  notable_quotes jsonb,
  source_citations jsonb,
  content_warnings text[],
  audience text,            -- originally an enum in later migration; keep text here for ordering safety
  difficulty text,          -- originally an enum in later migration; keep text here for ordering safety
  reading_time_minutes int,
  audio_duration_minutes int,
  cover_image_path text,
  pdf_path text,
  audio_path text,
  tags text[] default array[]::text[],
  version int DEFAULT 1,
  qa_flags jsonb,
  moderation_notes text,
  updated_by_user_id uuid REFERENCES public.users(id),
  owner_user_id uuid REFERENCES public.users(id),

  -- keep the legacy owner column from the original migration for compatibility
  owner text,

  view_count bigint DEFAULT 0,
  favorite_count bigint DEFAULT 0,
  rating_count int DEFAULT 0,
  rating_avg numeric(5,2) DEFAULT 0,
  visibility text,
  locale text,
  search_vector tsvector,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_book_summaries_created_at on public.book_summaries (created_at desc);
create index if not exists idx_book_summaries_owner on public.book_summaries (owner);

-- Trigger to update updated_at on row modification
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_updated_at on public.book_summaries;
create trigger trg_set_updated_at
  before update on public.book_summaries
  for each row
  execute procedure public.set_updated_at();

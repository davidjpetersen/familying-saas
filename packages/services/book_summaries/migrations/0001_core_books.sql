-- Book summaries feature schema
-- Move relevant tables and indexes

-- create table if not exists and additive changes for book_summaries
create table if not exists public.book_summaries (
  id text primary key,
  document jsonb not null,
  schema_version text not null,
  status text not null check (status in ('draft','final','published','in_review','archived')),
  book jsonb,
  metadata jsonb,
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
  audience text,
  difficulty text,
  reading_time_minutes int,
  audio_duration_minutes int,
  cover_image_path text,
  pdf_path text,
  audio_path text,
  tags text[] default array[]::text[],
  version int DEFAULT 1,
  qa_flags jsonb,
  moderation_notes text,
  updated_by_user_id uuid,
  owner_user_id uuid,
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

-- triggers/functions
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_updated_at on public.book_summaries;
create trigger trg_set_updated_at before update on public.book_summaries for each row execute procedure public.set_updated_at();

-- ensure enums and constraints
DO $$ BEGIN
  CREATE TYPE publication_status AS ENUM ('draft','in_review','published','archived','final');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE audience_type AS ENUM ('general','parents','educators','higher_ed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE difficulty_level AS ENUM ('intro','intermediate','advanced');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.book_summaries
  ALTER COLUMN status TYPE publication_status USING (CASE WHEN status='final' THEN 'published' ELSE status END::publication_status),
  ALTER COLUMN audience TYPE audience_type USING (audience::audience_type),
  ALTER COLUMN difficulty TYPE difficulty_level USING (difficulty::difficulty_level);

CREATE UNIQUE INDEX IF NOT EXISTS idx_book_summaries_isbn13_unique ON public.book_summaries (isbn_13) WHERE isbn_13 IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_book_summaries_isbn10_unique ON public.book_summaries (isbn_10) WHERE isbn_10 IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_book_summaries_slug_unique ON public.book_summaries (slug) WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_book_summaries_search ON public.book_summaries USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_book_summaries_tags ON public.book_summaries USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_book_summaries_status ON public.book_summaries (status);
CREATE INDEX IF NOT EXISTS idx_book_summaries_pubdate ON public.book_summaries (publication_date);

create or replace function public.book_summaries_tsv_update() RETURNS trigger LANGUAGE plpgsql AS $$
begin
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce((NEW.book->>'title')::text,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce((NEW.book->>'subtitle')::text,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce((NEW.document->>'overview')::text,'')), 'C');
  return NEW;
end $$;

drop trigger if exists trg_book_summaries_tsv on public.book_summaries;
create trigger trg_book_summaries_tsv before insert or update on public.book_summaries for each row execute function public.book_summaries_tsv_update();

create or replace function public.generate_slug() returns trigger language plpgsql as $$
declare base text; candidate text; suffix int := 1; begin
  if NEW.slug is not null and NEW.slug <> '' then return NEW; end if;
  base := lower(regexp_replace(coalesce((NEW.book->>'title')::text, ''), '[^a-z0-9\-\s]', '', 'g'));
  base := regexp_replace(base, '\s+', '-', 'g');
  candidate := left(base, 200);
  while exists (select 1 from public.book_summaries where slug = candidate and id <> NEW.id) loop
    suffix := suffix + 1;
    candidate := left(base || '-' || suffix::text, 200);
  end loop;
  NEW.slug := candidate; return NEW;
end $$;

drop trigger if exists trg_book_summaries_slug on public.book_summaries;
create trigger trg_book_summaries_slug before insert or update on public.book_summaries for each row execute function public.generate_slug();

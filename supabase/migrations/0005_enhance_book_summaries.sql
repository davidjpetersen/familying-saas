-- Migration: enhance book_summaries with metadata, search, constraints, and enums
-- Adds many columns for identity, bibliographic detail, content structure, workflow, and search

-- Enums
DO $$ BEGIN
  CREATE TYPE publication_status AS ENUM ('draft','in_review','published','archived', 'final');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE audience_type AS ENUM ('general','parents','educators','higher_ed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE difficulty_level AS ENUM ('intro','intermediate','advanced');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add columns (if they don't already exist)
ALTER TABLE public.book_summaries
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS external_ids jsonb,
  ADD COLUMN IF NOT EXISTS isbn_10 text,
  ADD COLUMN IF NOT EXISTS isbn_13 text,
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS publisher text,
  ADD COLUMN IF NOT EXISTS publication_date date,
  ADD COLUMN IF NOT EXISTS edition text,
  ADD COLUMN IF NOT EXISTS language_code text,
  ADD COLUMN IF NOT EXISTS page_count int,
  ADD COLUMN IF NOT EXISTS series_name text,
  ADD COLUMN IF NOT EXISTS series_number numeric,
  ADD COLUMN IF NOT EXISTS toc jsonb,
  ADD COLUMN IF NOT EXISTS notable_quotes jsonb,
  ADD COLUMN IF NOT EXISTS source_citations jsonb,
  ADD COLUMN IF NOT EXISTS content_warnings text[],
  ADD COLUMN IF NOT EXISTS audience audience_type,
  ADD COLUMN IF NOT EXISTS difficulty difficulty_level,
  ADD COLUMN IF NOT EXISTS reading_time_minutes int,
  ADD COLUMN IF NOT EXISTS audio_duration_minutes int,
  ADD COLUMN IF NOT EXISTS cover_image_path text,
  ADD COLUMN IF NOT EXISTS pdf_path text,
  ADD COLUMN IF NOT EXISTS audio_path text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS version int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS qa_flags jsonb,
  ADD COLUMN IF NOT EXISTS moderation_notes text,
  ADD COLUMN IF NOT EXISTS updated_by_user_id uuid REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS view_count bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS favorite_count bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_avg numeric(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS visibility text,
  ADD COLUMN IF NOT EXISTS locale text,
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Ensure we have a status column that uses the new enum
-- Defensive migration: check current column type and act accordingly to avoid operator errors
DO $$
DECLARE
  data_type text;
  udt_name text;
BEGIN
  SELECT c.data_type, c.udt_name INTO data_type, udt_name
  FROM information_schema.columns c
  WHERE c.table_schema = 'public' AND c.table_name = 'book_summaries' AND c.column_name = 'status';

  IF data_type IS NULL THEN
    -- no status column found, nothing to do
    RAISE NOTICE 'book_summaries.status column not found; skipping status migration';
  ELSIF data_type = 'text' THEN
    -- column is plain text: normalize legacy literal values using text comparisons,
    -- then safely alter the column type by casting from text -> enum
    UPDATE public.book_summaries SET status = 'published' WHERE status = 'final';

    ALTER TABLE public.book_summaries
      ALTER COLUMN status TYPE publication_status
      USING (status::publication_status);
  ELSIF data_type = 'USER-DEFINED' AND udt_name = 'publication_status' THEN
    -- already the desired enum: update rows using explicit enum literal to avoid enum = text comparisons
    UPDATE public.book_summaries SET status = 'published'::publication_status WHERE status::text = 'final';
  ELSE
    -- other types (safe fallback): compare via text and cast the result to the enum
    BEGIN
      UPDATE public.book_summaries
      SET status = (CASE WHEN status::text = 'final' THEN 'published' ELSE status::text END)::publication_status;
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Unable to migrate book_summaries.status from type % (udt=%). Manual intervention may be required.', data_type, udt_name;
    END;
  END IF;
END$$;

-- Constraints: add each constraint only if it does not already exist (pg_constraint check)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'isbn10_format_chk') THEN
    EXECUTE 'ALTER TABLE public.book_summaries ADD CONSTRAINT isbn10_format_chk CHECK (isbn_10 IS NULL OR isbn_10 ~ ''^[0-9X]{10}$'')';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'isbn13_format_chk') THEN
    EXECUTE 'ALTER TABLE public.book_summaries ADD CONSTRAINT isbn13_format_chk CHECK (isbn_13 IS NULL OR isbn_13 ~ ''^[0-9]{13}$'')';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'language_code_chk') THEN
    EXECUTE 'ALTER TABLE public.book_summaries ADD CONSTRAINT language_code_chk CHECK (language_code IS NULL OR language_code ~ ''^[a-z]{2}$'')';
  END IF;
END$$;

-- Unique indexes for nullable ISBNs and slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_book_summaries_isbn13_unique ON public.book_summaries (isbn_13) WHERE isbn_13 IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_book_summaries_isbn10_unique ON public.book_summaries (isbn_10) WHERE isbn_10 IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_book_summaries_slug_unique ON public.book_summaries (slug) WHERE slug IS NOT NULL;

-- Indexes for search and discovery
CREATE INDEX IF NOT EXISTS idx_book_summaries_search ON public.book_summaries USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_book_summaries_tags ON public.book_summaries USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_book_summaries_status ON public.book_summaries (status);
CREATE INDEX IF NOT EXISTS idx_book_summaries_pubdate ON public.book_summaries (publication_date);

-- Trigger to update search_vector
CREATE OR REPLACE FUNCTION public.book_summaries_tsv_update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce((NEW.book->>'title')::text,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce((NEW.book->>'subtitle')::text,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce((NEW.document->>'overview')::text,'')), 'C');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_book_summaries_tsv ON public.book_summaries;
CREATE TRIGGER trg_book_summaries_tsv BEFORE INSERT OR UPDATE
  ON public.book_summaries FOR EACH ROW EXECUTE FUNCTION public.book_summaries_tsv_update();

-- updated_at trigger already exists in earlier migration; ensure it's present
-- (function public.set_updated_at() should exist from earlier migration)

-- Slug generator: if slug is null or empty, generate from title and handle collisions
CREATE OR REPLACE FUNCTION public.generate_slug() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  base text;
  candidate text;
  suffix int := 1;
BEGIN
  IF NEW.slug IS NOT NULL AND NEW.slug <> '' THEN
    RETURN NEW;
  END IF;

  base := lower(regexp_replace(coalesce((NEW.book->>'title')::text, ''), '[^a-z0-9\-\s]', '', 'g'));
  base := regexp_replace(base, '\s+', '-', 'g');
  candidate := left(base, 200);

  WHILE EXISTS (SELECT 1 FROM public.book_summaries WHERE slug = candidate AND id <> NEW.id) LOOP
    suffix := suffix + 1;
    candidate := left(base || '-' || suffix::text, 200);
  END LOOP;

  NEW.slug := candidate;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_book_summaries_slug ON public.book_summaries;
CREATE TRIGGER trg_book_summaries_slug BEFORE INSERT OR UPDATE
  ON public.book_summaries FOR EACH ROW EXECUTE FUNCTION public.generate_slug();

-- updated_at trigger (re-create to be safe)
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_set_updated_at ON public.book_summaries;
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.book_summaries
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Optionally: a materialized view or denormalized table could be added later for fast search

-- Notes:
--  - This migration is additive and attempts to be idempotent using IF NOT EXISTS where possible.
--  - Ensure your app's server-side helpers and API routes are updated to use the new 'published' status value.
-- updated_at trigger (re-create to be safe)
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_set_updated_at ON public.book_summaries;
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.book_summaries
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Optionally: a materialized view or denormalized table could be added later for fast search

-- Notes:
--  - This migration is additive and attempts to be idempotent using IF NOT EXISTS where possible.
--  - Ensure your app's server-side helpers and API routes are updated to use the new 'published' status value.

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
  tags text[] default array[]::text[],
  owner text,
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

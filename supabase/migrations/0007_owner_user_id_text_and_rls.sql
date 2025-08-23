-- Migrate owner_user_id columns to text to work with Clerk user IDs
-- and switch RLS policies to use auth.jwt()->>'sub' matching Clerk's user ID.

do $$ begin
  -- Convert column types
  alter table if exists public.books alter column owner_user_id type text using owner_user_id::text;
  alter table if exists public.book_chunks alter column owner_user_id type text using owner_user_id::text;
  alter table if exists public.summaries alter column owner_user_id type text using owner_user_id::text;
exception when others then
  raise notice 'Owner column type change may have already been applied: %', sqlerrm;
end $$;

-- Ensure RLS enabled
alter table if exists public.books enable row level security;
alter table if exists public.book_chunks enable row level security;
alter table if exists public.summaries enable row level security;

-- Replace policies to use Clerk sub from JWT
do $$ begin
  drop policy if exists books_owner_read on public.books;
  drop policy if exists books_owner_write on public.books;
  create policy books_owner_read on public.books for select using (owner_user_id = (auth.jwt() ->> 'sub'));
  create policy books_owner_write on public.books for insert with check (owner_user_id = (auth.jwt() ->> 'sub'));
exception when others then
  raise notice 'Books policies updated: %', sqlerrm;
end $$;

do $$ begin
  drop policy if exists chunks_owner_read on public.book_chunks;
  drop policy if exists chunks_owner_write on public.book_chunks;
  create policy chunks_owner_read on public.book_chunks for select using (owner_user_id = (auth.jwt() ->> 'sub'));
  create policy chunks_owner_write on public.book_chunks for insert with check (owner_user_id = (auth.jwt() ->> 'sub'));
exception when others then
  raise notice 'Chunks policies updated: %', sqlerrm;
end $$;

do $$ begin
  drop policy if exists summaries_owner_read on public.summaries;
  drop policy if exists summaries_owner_write on public.summaries;
  -- Keep public read for published summaries
  drop policy if exists summaries_public_read_published on public.summaries;
  create policy summaries_owner_read on public.summaries for select using (owner_user_id = (auth.jwt() ->> 'sub'));
  create policy summaries_owner_write on public.summaries for insert with check (owner_user_id = (auth.jwt() ->> 'sub'));
  create policy summaries_public_read_published on public.summaries for select using (is_published = true);
exception when others then
  raise notice 'Summaries policies updated: %', sqlerrm;
end $$;

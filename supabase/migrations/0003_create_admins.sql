-- Create admins table to list users who have admin privileges
create table if not exists public.admins (
  id text primary key,
  clerk_user_id text,
  email text,
  created_at timestamptz default now()
);

-- Allow selecting rows only when the auth.jwt() sub matches clerk_user_id
-- Note: this policy assumes your auth JWT includes the Clerk subject claim as 'sub'
alter table public.admins enable row level security;

create policy "admin_select_own" on public.admins
  for select using (auth.jwt() ->> 'sub' = clerk_user_id);

create policy "admin_insert_own" on public.admins
  for insert with check (auth.jwt() ->> 'sub' = clerk_user_id);

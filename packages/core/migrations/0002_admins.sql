-- Admins table and policies
create table if not exists public.admins (
  id text primary key,
  clerk_user_id text,
  email text,
  created_at timestamptz default now()
);

alter table public.admins enable row level security;

DO $$ BEGIN
  CREATE POLICY admin_select_own ON public.admins FOR SELECT USING (auth.jwt() ->> 'sub' = clerk_user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY admin_insert_own ON public.admins FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = clerk_user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed initial admin
insert into public.admins (id, clerk_user_id, email, created_at)
values (
  'user_30XBoizcJs7mI8LqD9keBwkcR1a',
  'user_30XBoizcJs7mI8LqD9keBwkcR1a',
  'david.petersen@familying.org',
  now()
)
on conflict (id) do update set clerk_user_id = excluded.clerk_user_id, email = excluded.email;

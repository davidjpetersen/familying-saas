-- Core schema: users, families, subscriptions, features, access, quiz responses
create extension if not exists "pgcrypto";

create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    clerk_user_id text unique not null,
    email text,
    created_at timestamptz default now()
);

create table if not exists public.families (
    id uuid primary key default gen_random_uuid(),
    owner_user_id uuid references public.users(id),
    clerk_org_id text,
    name text,
    created_at timestamptz default now()
);

create table if not exists public.family_members (
    id uuid primary key default gen_random_uuid(),
    family_id uuid references public.families(id),
    type text check (type in ('adult','child')),
    display_name text,
    birthdate date,
    tags jsonb default '{}'::jsonb,
    created_at timestamptz default now()
);

create table if not exists public.subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id),
    status text,
    plan text,
    current_period_end timestamptz,
    created_at timestamptz default now()
);

create table if not exists public.features (
    key text primary key,
    label text not null,
    tier text check (tier in ('free','pro')),
    enabled boolean default true,
    rollout jsonb default '{}'::jsonb
);

create table if not exists public.microservice_access (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id),
    feature_key text references public.features(key),
    has_access boolean default false,
    created_at timestamptz default now()
);

create table if not exists public.quiz_responses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id),
    payload jsonb not null,
    created_at timestamptz default now()
);

alter table public.users enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.subscriptions enable row level security;
alter table public.microservice_access enable row level security;
alter table public.quiz_responses enable row level security;

-- Users can view and update their own record
DO $$ BEGIN
  CREATE POLICY "Users can view own" ON public.users FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own" ON public.users FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub') WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Families policies
DO $$ BEGIN
  CREATE POLICY "Family owners access" ON public.families FOR ALL USING (
    owner_user_id = (select id from public.users u where u.clerk_user_id = auth.jwt() ->> 'sub')
  ) WITH CHECK (
    owner_user_id = (select id from public.users u where u.clerk_user_id = auth.jwt() ->> 'sub')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Family members policies
DO $$ BEGIN
  CREATE POLICY "Family owners manage members" ON public.family_members FOR ALL USING (
    exists (select 1 from public.families f where f.id = family_id and f.owner_user_id = (select id from public.users u where u.clerk_user_id = auth.jwt() ->> 'sub'))
  ) WITH CHECK (
    exists (select 1 from public.families f where f.id = family_id and f.owner_user_id = (select id from public.users u where u.clerk_user_id = auth.jwt() ->> 'sub'))
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Subscriptions policies
DO $$ BEGIN
  CREATE POLICY "Users manage own subscriptions" ON public.subscriptions FOR ALL USING (
    user_id = (select id from public.users u where u.clerk_user_id = auth.jwt() ->> 'sub')
  ) WITH CHECK (
    user_id = (select id from public.users u where u.clerk_user_id = auth.jwt() ->> 'sub')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Microservice access policies
DO $$ BEGIN
  CREATE POLICY "Users manage own microservice access" ON public.microservice_access FOR ALL USING (
    user_id = (select id from public.users u where u.clerk_user_id = auth.jwt() ->> 'sub')
  ) WITH CHECK (
    user_id = (select id from public.users u where u.clerk_user_id = auth.jwt() ->> 'sub')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Quiz responses policies
DO $$ BEGIN
  CREATE POLICY "Users manage own quiz responses" ON public.quiz_responses FOR ALL USING (
    user_id = (select id from public.users u where u.clerk_user_id = auth.jwt() ->> 'sub')
  ) WITH CHECK (
    user_id = (select id from public.users u where u.clerk_user_id = auth.jwt() ->> 'sub')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed features
insert into public.features (key, label, tier, enabled) values
  ('book_summaries','Book Summaries','free',true),
  ('activities','Activities','free',true),
  ('conversation_starters','Conversation Starters','free',true),
  ('sleep_sounds','Sleep Sounds','pro',true),
  ('bedtime_stories','Bedtime Story Generator','pro',true),
  ('meal_planner','Meal Planner','pro',true)
  on conflict (key) do nothing;

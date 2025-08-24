-- Meal Planner feature schema
create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id),
  week_start date not null,
  plan jsonb not null,
  shopping_list jsonb,
  created_at timestamptz default now()
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text,
  cuisine text,
  prep_time_minutes int,
  dietary_tags jsonb,
  ingredients jsonb,
  steps jsonb,
  kid_blurb text,
  metadata jsonb,
  created_by uuid references public.users(id),
  is_public boolean default false,
  created_at timestamptz default now()
);

-- Core profiles table. One row per auth user.
-- Note: birthdate is stored instead of a raw age so it never goes stale;
-- age is computed at read time. email_verified is NOT stored here — it is
-- derived live from auth.users.email_confirmed_at in the app layer.
-- The cross-user SELECT visibility policy is added in the blocks migration,
-- since it references the blocks table.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  birthdate date not null,
  gender text,
  bio text,
  relationship_status text not null
    check (relationship_status in ('divorced', 'widowed', 'never_married', 'other')),
  photo_urls text[] not null default '{}',
  city_id uuid references public.cities(id),
  budget_min integer check (budget_min >= 0),
  budget_max integer check (budget_max >= 0),
  move_in_timeframe text
    check (move_in_timeframe in ('immediate', 'within_1_month', 'within_3_months', 'flexible')),
  phone_verified boolean not null default false,
  id_verified boolean not null default false,
  notify_new_match boolean not null default true,
  notify_new_message boolean not null default true,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (budget_max is null or budget_min is null or budget_max >= budget_min)
);

alter table public.profiles enable row level security;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create policy "user can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "user can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "user can delete own profile"
  on public.profiles for delete
  to authenticated
  using (auth.uid() = id);

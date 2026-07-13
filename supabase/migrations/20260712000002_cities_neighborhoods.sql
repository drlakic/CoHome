-- Reference data: cities and neighborhoods.
-- City/region is structured data so launching a new city is a data change,
-- never a code change.

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text not null,
  country text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (name, region, country)
);

alter table public.cities enable row level security;

create policy "cities readable by authenticated users"
  on public.cities for select
  to authenticated
  using (true);

-- No insert/update/delete policies: reference data is written only via
-- migrations (service role bypasses RLS).

create table public.neighborhoods (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (city_id, name)
);

alter table public.neighborhoods enable row level security;

create policy "neighborhoods readable by authenticated users"
  on public.neighborhoods for select
  to authenticated
  using (true);

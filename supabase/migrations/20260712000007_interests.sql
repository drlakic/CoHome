-- Free-taggable interests. The catalog is append-only from the app: any
-- authenticated user can add a new tag (the app normalizes to a slug and
-- re-selects on unique violation), but nobody can edit or delete catalog
-- entries through the API.

create table public.interests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.interests enable row level security;

create policy "interests readable by authenticated users"
  on public.interests for select
  to authenticated
  using (true);

create policy "authenticated users can add interest tags"
  on public.interests for insert
  to authenticated
  with check (true);

create table public.profile_interests (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  interest_id uuid not null references public.interests(id) on delete cascade,
  primary key (profile_id, interest_id)
);

alter table public.profile_interests enable row level security;

create index profile_interests_interest_id_idx on public.profile_interests (interest_id);

create policy "profile interests visible if profile visible"
  on public.profile_interests for select
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_interests.profile_id));

create policy "owner writes profile interests"
  on public.profile_interests for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

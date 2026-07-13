-- Which neighborhoods a member is open to living in. Many-to-many.

create table public.profile_neighborhood_preferences (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  neighborhood_id uuid not null references public.neighborhoods(id) on delete cascade,
  primary key (profile_id, neighborhood_id)
);

alter table public.profile_neighborhood_preferences enable row level security;

create policy "neighborhood prefs visible if profile visible"
  on public.profile_neighborhood_preferences for select
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_neighborhood_preferences.profile_id));

create policy "owner writes neighborhood prefs"
  on public.profile_neighborhood_preferences for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

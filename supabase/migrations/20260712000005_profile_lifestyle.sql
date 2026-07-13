-- Lifestyle & house rules. Kept as a 1:1 child table of profiles: it mirrors
-- the onboarding step boundary, and "row exists" doubles as a step-complete
-- signal. SELECT visibility is inherited from profiles' own RLS by
-- re-querying profiles inside the policy.

create table public.profile_lifestyle (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  pets text check (pets in ('has_pets', 'okay_with_pets', 'no_pets')),
  smoking text check (smoking in ('yes', 'no', 'outside_only')),
  cleanliness_level smallint check (cleanliness_level between 1 and 5),
  schedule_type text check (schedule_type in ('early_riser', 'night_owl', 'flexible')),
  noise_tolerance smallint check (noise_tolerance between 1 and 5),
  overnight_guests_frequency text
    check (overnight_guests_frequency in ('never', 'occasionally', 'regularly')),
  overnight_guests_notice text
    check (overnight_guests_notice in ('no_notice_needed', 'some_notice', 'advance_notice_required')),
  dating_while_cohabiting_preference text
    check (dating_while_cohabiting_preference in ('comfortable', 'prefer_discreet', 'prefer_not_dating')),
  hosting_frequency text check (hosting_frequency in ('never', 'small_only', 'regularly')),
  shared_space_guest_policy text,
  updated_at timestamptz not null default now()
);

alter table public.profile_lifestyle enable row level security;

create trigger profile_lifestyle_set_updated_at
  before update on public.profile_lifestyle
  for each row execute function public.set_updated_at();

create policy "lifestyle visible if profile visible"
  on public.profile_lifestyle for select
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_lifestyle.profile_id));

create policy "owner writes lifestyle"
  on public.profile_lifestyle for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

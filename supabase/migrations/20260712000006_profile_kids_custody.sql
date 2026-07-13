-- Kids & custody. Same 1:1 child-table pattern as profile_lifestyle.

create table public.profile_kids_custody (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  has_kids boolean not null default false,
  num_kids smallint check (num_kids >= 0),
  kid_ages smallint[] not null default '{}',
  custody_arrangement text
    check (custody_arrangement in ('full_time', 'shared', 'occasional', 'none')),
  typical_schedule text,
  roommate_kids_preference text
    check (roommate_kids_preference in ('comfortable', 'prefer_no_kids', 'no_preference')),
  updated_at timestamptz not null default now()
);

alter table public.profile_kids_custody enable row level security;

create trigger profile_kids_custody_set_updated_at
  before update on public.profile_kids_custody
  for each row execute function public.set_updated_at();

create policy "kids info visible if profile visible"
  on public.profile_kids_custody for select
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_kids_custody.profile_id));

create policy "owner writes kids info"
  on public.profile_kids_custody for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

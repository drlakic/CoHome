-- Interest/connection state between two members. One row per user pair,
-- canonically ordered (user_a < user_b) so a pair can never have two rows.
--
-- status is derived by trigger from the two interest booleans and is never
-- trusted from app code. 'declined' is sticky: once a row is declined
-- (currently only the block cascade does this), interest flags can no longer
-- resurrect it — without this, a block-driven decline would be silently
-- overwritten back to 'mutual' on the next update where both flags are true.

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  user_a_interested boolean not null default false,
  user_b_interested boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'mutual', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);

alter table public.matches enable row level security;

create index matches_user_a_idx on public.matches (user_a);
create index matches_user_b_idx on public.matches (user_b);

create trigger matches_set_updated_at
  before update on public.matches
  for each row execute function public.set_updated_at();

create or replace function public.compute_match_status()
returns trigger
language plpgsql
as $$
begin
  -- Declined is terminal.
  if tg_op = 'UPDATE' and old.status = 'declined' then
    new.status := 'declined';
    return new;
  end if;
  if new.status = 'declined' then
    return new;
  end if;
  if new.user_a_interested and new.user_b_interested then
    new.status := 'mutual';
  else
    new.status := 'pending';
  end if;
  return new;
end;
$$;

create trigger matches_compute_status
  before insert or update on public.matches
  for each row execute function public.compute_match_status();

create policy "participants can view their match"
  on public.matches for select
  to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

create policy "participant can create a match row with an unblocked user"
  on public.matches for insert
  to authenticated
  with check (
    (auth.uid() = user_a or auth.uid() = user_b)
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = user_a and b.blocked_id = user_b)
         or (b.blocker_id = user_b and b.blocked_id = user_a)
    )
  );

create policy "participant can update their match with an unblocked user"
  on public.matches for update
  to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b)
  with check (
    (auth.uid() = user_a or auth.uid() = user_b)
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = user_a and b.blocked_id = user_b)
         or (b.blocker_id = user_b and b.blocked_id = user_a)
    )
  );

-- Blocking severs any existing match, both directions.
-- SECURITY DEFINER because the blocker may not pass the matches update
-- policy themselves once the block row exists.
create or replace function public.decline_matches_on_block()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.matches
    set status = 'declined'
    where (user_a = new.blocker_id and user_b = new.blocked_id)
       or (user_a = new.blocked_id and user_b = new.blocker_id);
  return new;
end;
$$;

create trigger on_block_decline_match
  after insert on public.blocks
  for each row execute function public.decline_matches_on_block();

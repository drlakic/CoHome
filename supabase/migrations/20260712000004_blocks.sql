-- Blocks are one-directional. A block in either direction hides the two
-- users from each other everywhere (browse, profile detail, messaging).
-- The blocked party is never told who blocked them.

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  check (blocker_id <> blocked_id),
  unique (blocker_id, blocked_id)
);

alter table public.blocks enable row level security;

create index blocks_blocked_id_idx on public.blocks (blocked_id);

create policy "user sees own block list"
  on public.blocks for select
  to authenticated
  using (auth.uid() = blocker_id);

create policy "user can block"
  on public.blocks for insert
  to authenticated
  with check (auth.uid() = blocker_id);

create policy "user can unblock"
  on public.blocks for delete
  to authenticated
  using (auth.uid() = blocker_id);

-- Cross-user profile visibility, now that blocks exists.
-- A profile is visible to: its owner always; other authenticated users only
-- if onboarding is complete and no block exists in either direction.
-- Scoped `to authenticated` deliberately: for anonymous requests auth.uid()
-- is null and the block-exclusion subquery would be vacuously true, which
-- would make every completed profile publicly readable.
create policy "profiles visible to self or unblocked members"
  on public.profiles for select
  to authenticated
  using (
    auth.uid() = id
    or (
      onboarding_completed_at is not null
      and not exists (
        select 1 from public.blocks b
        where (b.blocker_id = auth.uid() and b.blocked_id = profiles.id)
           or (b.blocker_id = profiles.id and b.blocked_id = auth.uid())
      )
    )
  );

-- Fix: block-exclusion checks inside RLS policies previously queried the
-- blocks table directly, but that subquery runs under the *viewer's* RLS on
-- blocks — and viewers can only see blocks they created. Result: a block
-- hid the blocker from the blocked user, but not the other way around.
-- (Caught by live test: after David blocked Margaret, Margaret could still
-- see David's profile.)
--
-- is_blocked_between runs SECURITY DEFINER so it sees all block rows,
-- regardless of who is asking. It leaks nothing: callers only learn whether
-- a pair they're already asking about is blocked, which every policy below
-- already implied.

create or replace function public.is_blocked_between(a uuid, b uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b)
       or (blocker_id = b and blocked_id = a)
  );
$$;

-- profiles: recreate the visibility policy on top of the helper
drop policy "profiles visible to self or unblocked members" on public.profiles;
create policy "profiles visible to self or unblocked members"
  on public.profiles for select
  to authenticated
  using (
    auth.uid() = id
    or (
      onboarding_completed_at is not null
      and not public.is_blocked_between(auth.uid(), profiles.id)
    )
  );

-- matches: insert/update must not work across a block
drop policy "participant can create a match row with an unblocked user" on public.matches;
create policy "participant can create a match row with an unblocked user"
  on public.matches for insert
  to authenticated
  with check (
    (auth.uid() = user_a or auth.uid() = user_b)
    and not public.is_blocked_between(user_a, user_b)
  );

drop policy "participant can update their match with an unblocked user" on public.matches;
create policy "participant can update their match with an unblocked user"
  on public.matches for update
  to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b)
  with check (
    (auth.uid() = user_a or auth.uid() = user_b)
    and not public.is_blocked_between(user_a, user_b)
  );

-- messages: read/send must not work across a block
drop policy "participants of a mutual unblocked match can read messages" on public.messages;
create policy "participants of a mutual unblocked match can read messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = messages.match_id
        and m.status = 'mutual'
        and (m.user_a = auth.uid() or m.user_b = auth.uid())
        and not public.is_blocked_between(m.user_a, m.user_b)
    )
  );

drop policy "participants of a mutual unblocked match can send messages" on public.messages;
create policy "participants of a mutual unblocked match can send messages"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.matches m
      where m.id = messages.match_id
        and m.status = 'mutual'
        and (m.user_a = auth.uid() or m.user_b = auth.uid())
        and not public.is_blocked_between(m.user_a, m.user_b)
    )
  );

-- Per-user read markers for chat threads. Unread = messages from the other
-- person newer than my last_read_at for that match (no row = never read).

create table public.match_reads (
  match_id uuid not null references public.matches(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (match_id, profile_id)
);

alter table public.match_reads enable row level security;

create policy "own read markers"
  on public.match_reads for select
  to authenticated
  using (profile_id = auth.uid());

create policy "participant can create own read marker"
  on public.match_reads for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and (m.user_a = auth.uid() or m.user_b = auth.uid())
    )
  );

create policy "participant can update own read marker"
  on public.match_reads for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Total unread messages for the caller. SECURITY INVOKER (default): the
-- messages RLS policy does the heavy lifting — only mutual, unblocked,
-- participant-visible messages are counted.
create or replace function public.unread_message_count()
returns integer
language sql
stable
set search_path = public
as $$
  select count(*)::integer
  from public.messages msg
  where msg.sender_id <> auth.uid()
    and msg.created_at > coalesce(
      (
        select r.last_read_at
        from public.match_reads r
        where r.match_id = msg.match_id
          and r.profile_id = auth.uid()
      ),
      '-infinity'::timestamptz
    );
$$;

revoke execute on function public.unread_message_count() from public;
revoke execute on function public.unread_message_count() from anon;
grant execute on function public.unread_message_count() to authenticated;

-- In-app messages, one thread per match. Readable and writable only by the
-- two participants, only while the match is mutual, and only if no block
-- exists between them. Messages are immutable in v1 (no update/delete).

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create index messages_match_id_created_at_idx on public.messages (match_id, created_at);

create policy "participants of a mutual unblocked match can read messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = messages.match_id
        and m.status = 'mutual'
        and (m.user_a = auth.uid() or m.user_b = auth.uid())
        and not exists (
          select 1 from public.blocks b
          where (b.blocker_id = m.user_a and b.blocked_id = m.user_b)
             or (b.blocker_id = m.user_b and b.blocked_id = m.user_a)
        )
    )
  );

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
        and not exists (
          select 1 from public.blocks b
          where (b.blocker_id = m.user_a and b.blocked_id = m.user_b)
             or (b.blocker_id = m.user_b and b.blocked_id = m.user_a)
        )
    )
  );

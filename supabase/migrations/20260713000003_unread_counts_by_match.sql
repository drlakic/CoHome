-- Per-conversation unread counts for the caller. SECURITY INVOKER: the
-- messages RLS policy scopes rows to mutual, unblocked conversations the
-- caller participates in.

create or replace function public.unread_counts_by_match()
returns table (match_id uuid, unread_count integer)
language sql
stable
set search_path = public
as $$
  select msg.match_id, count(*)::integer
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
    )
  group by msg.match_id;
$$;

revoke execute on function public.unread_counts_by_match() from public;
revoke execute on function public.unread_counts_by_match() from anon;
grant execute on function public.unread_counts_by_match() to authenticated;

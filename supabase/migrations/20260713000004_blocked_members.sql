-- The settings "blocked members" list needs the names of people you've
-- blocked — but the profiles RLS policy hides blocked users from each other
-- entirely. SECURITY DEFINER, scoped hard to the caller's own block list;
-- exposes only the name (needed to render "Unblock <name>").

create or replace function public.blocked_members()
returns table (blocked_id uuid, name text, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select b.blocked_id, p.name, b.created_at
  from public.blocks b
  join public.profiles p on p.id = b.blocked_id
  where b.blocker_id = auth.uid()
  order by b.created_at desc;
$$;

revoke execute on function public.blocked_members() from public;
revoke execute on function public.blocked_members() from anon;
grant execute on function public.blocked_members() to authenticated;

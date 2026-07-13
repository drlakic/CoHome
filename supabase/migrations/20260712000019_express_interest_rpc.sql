-- All match writes now go through express_interest(). Closes two API holes:
-- 1. Either participant could previously read the other's interest flag on a
--    pending row via REST, even though the UI never shows one-sided interest.
-- 2. Either participant could previously UPDATE the row directly — including
--    setting the OTHER person's interest flag.
-- Direct insert/update policies are dropped; the RPC (security definer, own
-- validation) is the only write path. SELECT now requires that you expressed
-- interest yourself, or that the match is mutual.

create or replace function public.express_interest(target uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  a uuid;
  b uuid;
  result_status text;
begin
  if me is null then
    raise exception 'not authenticated';
  end if;
  if target is null or target = me then
    raise exception 'invalid target';
  end if;
  if public.is_blocked_between(me, target) then
    raise exception 'connection unavailable';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = target and onboarding_completed_at is not null
  ) then
    raise exception 'connection unavailable';
  end if;

  if me < target then
    a := me; b := target;
  else
    a := target; b := me;
  end if;

  insert into public.matches (user_a, user_b, user_a_interested, user_b_interested)
  values (a, b, a = me, b = me)
  on conflict (user_a, user_b) do update
    set user_a_interested = matches.user_a_interested or excluded.user_a_interested,
        user_b_interested = matches.user_b_interested or excluded.user_b_interested
  returning status into result_status;

  return result_status;
end;
$$;

revoke execute on function public.express_interest(uuid) from public;
revoke execute on function public.express_interest(uuid) from anon;
grant execute on function public.express_interest(uuid) to authenticated;

drop policy "participant can create a match row with an unblocked user" on public.matches;
drop policy "participant can update their match with an unblocked user" on public.matches;
drop policy "participants can view their match" on public.matches;

create policy "participants see matches they joined or that are mutual"
  on public.matches for select
  to authenticated
  using (
    (auth.uid() = user_a and (user_a_interested or status = 'mutual'))
    or (auth.uid() = user_b and (user_b_interested or status = 'mutual'))
  );

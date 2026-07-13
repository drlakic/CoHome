-- Reports are an immutable log in v1 — no admin dashboard yet, rows just
-- accumulate with status 'open'. Reporters can see what they submitted;
-- reported users never see reports against them.

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_id uuid not null references public.profiles(id) on delete cascade,
  match_id uuid references public.matches(id) on delete set null,
  reason text not null
    check (reason in ('inappropriate_content', 'harassment', 'fake_profile', 'dating_solicitation', 'safety_concern', 'other')),
  details text,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed', 'actioned')),
  created_at timestamptz not null default now(),
  check (reporter_id <> reported_id)
);

alter table public.reports enable row level security;

create policy "user sees own submitted reports"
  on public.reports for select
  to authenticated
  using (auth.uid() = reporter_id);

create policy "user can submit a report"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = reporter_id and status = 'open');

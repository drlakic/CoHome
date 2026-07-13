-- Enable Realtime (postgres_changes) on messages. RLS policies apply to
-- realtime subscriptions automatically, so a client only receives events
-- for rows it is allowed to select.

alter publication supabase_realtime add table public.messages;

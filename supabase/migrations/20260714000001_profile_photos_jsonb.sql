-- Photos move from text[] to jsonb so each photo can carry framing data:
-- [{"url": ..., "pos_x": 0-100, "pos_y": 0-100}]. pos_x/pos_y drive CSS
-- object-position so members can adjust how a cropped photo is framed
-- (e.g. keep a face in frame). The first element is the primary photo.

alter table public.profiles add column photos jsonb not null default '[]'::jsonb;

update public.profiles
set photos = coalesce(
  (
    select jsonb_agg(jsonb_build_object('url', u, 'pos_x', 50, 'pos_y', 50))
    from unnest(photo_urls) as u
  ),
  '[]'::jsonb
)
where array_length(photo_urls, 1) > 0;

alter table public.profiles drop column photo_urls;

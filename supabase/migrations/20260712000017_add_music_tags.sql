-- Add electronic and rap/hip-hop to the Music category.

insert into public.interests (name, slug, category) values
  ('Electronic', 'electronic', 'music'),
  ('Rap & hip-hop', 'rap-hip-hop', 'music')
on conflict (slug) do nothing;

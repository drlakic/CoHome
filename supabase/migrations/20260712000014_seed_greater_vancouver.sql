-- Launch region: Greater Vancouver, BC. Neighborhood-level detail is seeded
-- for Vancouver only (its local planning areas — verify names against the
-- City of Vancouver's official list before launch copy is finalized);
-- other cities get neighborhood rows later as needed.

insert into public.cities (name, region, country, is_active)
values
  ('Vancouver', 'British Columbia', 'Canada', true),
  ('Burnaby', 'British Columbia', 'Canada', true),
  ('Richmond', 'British Columbia', 'Canada', true),
  ('New Westminster', 'British Columbia', 'Canada', true),
  ('Coquitlam', 'British Columbia', 'Canada', true),
  ('Port Coquitlam', 'British Columbia', 'Canada', true),
  ('Port Moody', 'British Columbia', 'Canada', true),
  ('North Vancouver', 'British Columbia', 'Canada', true),
  ('West Vancouver', 'British Columbia', 'Canada', true),
  ('Surrey', 'British Columbia', 'Canada', true)
on conflict (name, region, country) do nothing;

insert into public.neighborhoods (city_id, name)
select c.id, n.name
from public.cities c
cross join (
  values
    ('Arbutus Ridge'),
    ('Downtown'),
    ('Dunbar-Southlands'),
    ('Fairview'),
    ('Grandview-Woodland'),
    ('Hastings-Sunrise'),
    ('Kensington-Cedar Cottage'),
    ('Kerrisdale'),
    ('Killarney'),
    ('Kitsilano'),
    ('Marpole'),
    ('Mount Pleasant'),
    ('Oakridge'),
    ('Renfrew-Collingwood'),
    ('Riley Park'),
    ('Shaughnessy'),
    ('South Cambie'),
    ('Strathcona'),
    ('Sunset'),
    ('Victoria-Fraserview'),
    ('West End'),
    ('West Point Grey')
) as n(name)
where c.name = 'Vancouver' and c.region = 'British Columbia'
on conflict (city_id, name) do nothing;

-- Neighborhood seeds for the remaining Greater Vancouver cities, following
-- the Vancouver pattern. Lists are based on each city's commonly used
-- community/town-centre names — verify against official municipal lists
-- before launch copy is finalized.

insert into public.neighborhoods (city_id, name)
select c.id, n.name
from public.cities c
cross join (
  values
    ('Metrotown'), ('Brentwood'), ('Lougheed'), ('Edmonds'),
    ('Capitol Hill'), ('Burnaby Heights'), ('Deer Lake'), ('Big Bend')
) as n(name)
where c.name = 'Burnaby' and c.region = 'British Columbia'
on conflict (city_id, name) do nothing;

insert into public.neighborhoods (city_id, name)
select c.id, n.name
from public.cities c
cross join (
  values
    ('City Centre'), ('Steveston'), ('Terra Nova'), ('Thompson'),
    ('Seafair'), ('Broadmoor'), ('Ironwood'), ('Hamilton')
) as n(name)
where c.name = 'Richmond' and c.region = 'British Columbia'
on conflict (city_id, name) do nothing;

insert into public.neighborhoods (city_id, name)
select c.id, n.name
from public.cities c
cross join (
  values
    ('Downtown'), ('Uptown'), ('Sapperton'), ('Queensborough'),
    ('West End'), ('Queen''s Park'), ('Glenbrooke North'), ('Connaught Heights')
) as n(name)
where c.name = 'New Westminster' and c.region = 'British Columbia'
on conflict (city_id, name) do nothing;

insert into public.neighborhoods (city_id, name)
select c.id, n.name
from public.cities c
cross join (
  values
    ('Burquitlam'), ('Maillardville'), ('Austin Heights'), ('Westwood Plateau'),
    ('Burke Mountain'), ('Coquitlam West'), ('Central Coquitlam'), ('Ranch Park')
) as n(name)
where c.name = 'Coquitlam' and c.region = 'British Columbia'
on conflict (city_id, name) do nothing;

insert into public.neighborhoods (city_id, name)
select c.id, n.name
from public.cities c
cross join (
  values
    ('Citadel'), ('Glenwood'), ('Mary Hill'), ('Birchland Manor'),
    ('Lincoln Park'), ('Oxford Heights'), ('Riverwood')
) as n(name)
where c.name = 'Port Coquitlam' and c.region = 'British Columbia'
on conflict (city_id, name) do nothing;

insert into public.neighborhoods (city_id, name)
select c.id, n.name
from public.cities c
cross join (
  values
    ('Moody Centre'), ('Inlet Centre'), ('Heritage Mountain'),
    ('Heritage Woods'), ('College Park'), ('Glenayre'), ('Pleasantside')
) as n(name)
where c.name = 'Port Moody' and c.region = 'British Columbia'
on conflict (city_id, name) do nothing;

insert into public.neighborhoods (city_id, name)
select c.id, n.name
from public.cities c
cross join (
  values
    ('Lower Lonsdale'), ('Central Lonsdale'), ('Upper Lonsdale'),
    ('Lynn Valley'), ('Deep Cove'), ('Edgemont'), ('Pemberton Heights'), ('Seymour')
) as n(name)
where c.name = 'North Vancouver' and c.region = 'British Columbia'
on conflict (city_id, name) do nothing;

insert into public.neighborhoods (city_id, name)
select c.id, n.name
from public.cities c
cross join (
  values
    ('Ambleside'), ('Dundarave'), ('British Properties'),
    ('Horseshoe Bay'), ('Caulfeild'), ('Sentinel Hill'), ('Cypress Park')
) as n(name)
where c.name = 'West Vancouver' and c.region = 'British Columbia'
on conflict (city_id, name) do nothing;

insert into public.neighborhoods (city_id, name)
select c.id, n.name
from public.cities c
cross join (
  values
    ('City Centre'), ('Whalley'), ('Guildford'), ('Fleetwood'),
    ('Newton'), ('Cloverdale'), ('South Surrey')
) as n(name)
where c.name = 'Surrey' and c.region = 'British Columbia'
on conflict (city_id, name) do nothing;

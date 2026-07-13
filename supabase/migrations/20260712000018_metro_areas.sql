-- Matching is region-wide, not city-exact: someone in Coquitlam should see
-- candidates in Burnaby, Vancouver, etc. Cities are grouped into metro areas
-- and browse matches within the viewer's metro area. A future city launch
-- either joins an existing metro or starts its own — data, not code.

alter table public.cities add column metro_area text;

update public.cities
set metro_area = 'metro_vancouver'
where name in (
  'Vancouver', 'Burnaby', 'Richmond', 'New Westminster', 'Coquitlam',
  'Port Coquitlam', 'Port Moody', 'North Vancouver', 'West Vancouver', 'Surrey'
) and region = 'British Columbia';

alter table public.cities alter column metro_area set not null;

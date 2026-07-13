-- Interests change from free-taggable to a fixed curated catalog grouped by
-- category. Existing tags are test data only, so the catalog is rebuilt from
-- scratch (profile_interests rows cascade-delete with them).

delete from public.interests;

alter table public.interests
  add column category text not null default 'other';

alter table public.interests
  add constraint interests_category_check check (
    category in (
      'food_drink',
      'outdoors',
      'arts_culture',
      'music',
      'home_hobbies',
      'sports_fitness',
      'community_learning',
      'travel_leisure'
    )
  );

alter table public.interests alter column category drop default;

-- Catalog is now fixed: users can no longer add tags.
drop policy "authenticated users can add interest tags" on public.interests;

insert into public.interests (name, slug, category) values
  -- Food & Drink
  ('Cooking', 'cooking', 'food_drink'),
  ('Baking', 'baking', 'food_drink'),
  ('Coffee culture', 'coffee-culture', 'food_drink'),
  ('Wine & craft beer', 'wine-craft-beer', 'food_drink'),
  ('Trying new restaurants', 'trying-new-restaurants', 'food_drink'),
  ('Barbecuing', 'barbecuing', 'food_drink'),
  ('Vegetarian & plant-based', 'vegetarian-plant-based', 'food_drink'),
  ('Farmers markets', 'farmers-markets', 'food_drink'),
  -- Outdoors & Nature
  ('Walking', 'walking', 'outdoors'),
  ('Hiking', 'hiking', 'outdoors'),
  ('Gardening', 'gardening', 'outdoors'),
  ('Cycling', 'cycling', 'outdoors'),
  ('Camping', 'camping', 'outdoors'),
  ('Birdwatching', 'birdwatching', 'outdoors'),
  ('Fishing', 'fishing', 'outdoors'),
  ('Beach days', 'beach-days', 'outdoors'),
  ('Skiing & snowshoeing', 'skiing-snowshoeing', 'outdoors'),
  -- Arts & Culture
  ('Reading', 'reading', 'arts_culture'),
  ('Museums & galleries', 'museums-galleries', 'arts_culture'),
  ('Live theatre', 'live-theatre', 'arts_culture'),
  ('Film & cinema', 'film-cinema', 'arts_culture'),
  ('Photography', 'photography', 'arts_culture'),
  ('Painting & drawing', 'painting-drawing', 'arts_culture'),
  ('Writing', 'writing', 'arts_culture'),
  ('Crafts & DIY', 'crafts-diy', 'arts_culture'),
  -- Music
  ('Live music', 'live-music', 'music'),
  ('Playing an instrument', 'playing-an-instrument', 'music'),
  ('Singing & choir', 'singing-choir', 'music'),
  ('Jazz', 'jazz', 'music'),
  ('Classical', 'classical', 'music'),
  ('Folk & roots', 'folk-roots', 'music'),
  ('Vinyl & records', 'vinyl-records', 'music'),
  -- Home & Hobbies
  ('Board games', 'board-games', 'home_hobbies'),
  ('Puzzles', 'puzzles', 'home_hobbies'),
  ('Card games', 'card-games', 'home_hobbies'),
  ('Home improvement', 'home-improvement', 'home_hobbies'),
  ('Interior decorating', 'interior-decorating', 'home_hobbies'),
  ('Thrifting & antiques', 'thrifting-antiques', 'home_hobbies'),
  ('Knitting & sewing', 'knitting-sewing', 'home_hobbies'),
  ('Woodworking', 'woodworking', 'home_hobbies'),
  -- Sports & Fitness
  ('Yoga & pilates', 'yoga-pilates', 'sports_fitness'),
  ('Swimming', 'swimming', 'sports_fitness'),
  ('Running', 'running', 'sports_fitness'),
  ('Golf', 'golf', 'sports_fitness'),
  ('Tennis & pickleball', 'tennis-pickleball', 'sports_fitness'),
  ('Gym workouts', 'gym-workouts', 'sports_fitness'),
  ('Dancing', 'dancing', 'sports_fitness'),
  ('Curling', 'curling', 'sports_fitness'),
  -- Community & Learning
  ('Volunteering', 'volunteering', 'community_learning'),
  ('Book clubs', 'book-clubs', 'community_learning'),
  ('Languages', 'languages', 'community_learning'),
  ('Local history', 'local-history', 'community_learning'),
  ('Faith & spirituality', 'faith-spirituality', 'community_learning'),
  ('Genealogy & family history', 'genealogy-family-history', 'community_learning'),
  ('Mentoring', 'mentoring', 'community_learning'),
  -- Travel & Leisure
  ('Travel abroad', 'travel-abroad', 'travel_leisure'),
  ('Road trips', 'road-trips', 'travel_leisure'),
  ('Day trips & exploring', 'day-trips-exploring', 'travel_leisure'),
  ('Cruises', 'cruises', 'travel_leisure'),
  ('Camper & RV life', 'camper-rv-life', 'travel_leisure');

alter table public.profiles
  add column traveler_tags text[] not null default '{}'
  check (
    cardinality(traveler_tags) <= 6
    and traveler_tags <@ array[
      'adventure', 'relax', 'food', 'culture', 'nature', 'beach', 'mountains',
      'city', 'nightlife', 'photography', 'budget', 'comfort', 'planner',
      'spontaneous', 'early_riser', 'road_trip'
    ]::text[]
  );

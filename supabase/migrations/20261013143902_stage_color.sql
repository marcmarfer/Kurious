alter table public.stages
  add column color text
  check (color in ('lagoon', 'plum', 'ochre', 'berry', 'sky', 'forest', 'clay', 'slate'));

create or replace view public.trip_stages
with (security_invoker = true)
as
select
  st.id,
  st.trip_id,
  st.position,
  st.name,
  st.starts_on,
  st.ends_on,
  extensions.st_x(st.geom) as lon,
  extensions.st_y(st.geom) as lat,
  st.created_at,
  st.updated_at,
  st.color
from public.stages st;

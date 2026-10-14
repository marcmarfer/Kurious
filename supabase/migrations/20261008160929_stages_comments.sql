create table public.stages (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  position int not null check (position >= 1),
  name text not null check (char_length(trim(name)) between 1 and 80),
  starts_on date,
  ends_on date,
  geom extensions.geometry (Point, 4326),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_on is null or ends_on is null or ends_on >= starts_on),
  constraint stages_trip_position_key unique (trip_id, position) deferrable initially deferred,
  constraint stages_id_trip_key unique (id, trip_id)
);

create function public.stages_keep_owner_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.trip_id := old.trip_id;
  new.created_at := old.created_at;
  return new;
end;
$$;

create trigger stages_keep_owner_fields
  before update on public.stages
  for each row execute function public.stages_keep_owner_fields();
create trigger stages_updated_at before update on public.stages
  for each row execute function public.set_updated_at();

alter table public.ideas add column stage_id uuid;
-- The composite key keeps an idea's stage inside the idea's own trip.
alter table public.ideas
  add constraint ideas_stage_id_fkey foreign key (stage_id, trip_id)
  references public.stages (id, trip_id) on delete set null (stage_id);
create index ideas_stage_id_idx on public.ideas (stage_id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas (id) on delete cascade,
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  body text not null check (char_length(body) between 1 and 2000 and trim(body) <> ''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comments_idea_id_idx on public.comments (idea_id, created_at);
create index comments_author_id_idx on public.comments (author_id);

create function public.comments_keep_owner_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.idea_id := old.idea_id;
  new.author_id := old.author_id;
  new.created_at := old.created_at;
  return new;
end;
$$;

create trigger comments_keep_owner_fields
  before update on public.comments
  for each row execute function public.comments_keep_owner_fields();
create trigger comments_updated_at before update on public.comments
  for each row execute function public.set_updated_at();

alter table public.stages enable row level security;
alter table public.comments enable row level security;

create policy "stages: members read" on public.stages
  for select to authenticated
  using (private.is_member(trip_id));
create policy "stages: owner and editors add" on public.stages
  for insert to authenticated
  with check (private.trip_role(trip_id) in ('owner', 'editor'));
create policy "stages: owner and editors edit" on public.stages
  for update to authenticated
  using (private.trip_role(trip_id) in ('owner', 'editor'))
  with check (private.trip_role(trip_id) in ('owner', 'editor'));
create policy "stages: owner and editors delete" on public.stages
  for delete to authenticated
  using (private.trip_role(trip_id) in ('owner', 'editor'));

create policy "comments: members read" on public.comments
  for select to authenticated
  using (exists (
    select 1 from public.ideas i
    where i.id = idea_id and private.is_member(i.trip_id)
  ));
create policy "comments: members write as themselves" on public.comments
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (
      select 1 from public.ideas i
      where i.id = idea_id and private.is_member(i.trip_id)
    )
  );
create policy "comments: author edits own" on public.comments
  for update to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));
create policy "comments: author deletes own" on public.comments
  for delete to authenticated
  using (author_id = (select auth.uid()));

create view public.trip_ideas
with (security_invoker = true)
as
select
  r.id,
  r.trip_id,
  r.stage_id,
  r.kind,
  r.title,
  r.note,
  r.source_url,
  r.author_id,
  r.author_name,
  r.created_at,
  r.fire,
  r.up,
  r.down,
  r.score,
  case when r.top_rank = 1 and r.score >= 10 then 'fire' else r.stage end as growth,
  r.my_vote,
  r.comment_count,
  r.lon,
  r.lat,
  r.shape,
  r.length_m
from (
  select
    i.id,
    i.trip_id,
    i.stage_id,
    i.kind,
    i.title,
    i.note,
    i.source_url,
    i.author_id,
    coalesce(p.name, '') as author_name,
    i.created_at,
    s.fire,
    s.up,
    s.down,
    s.score,
    s.stage,
    row_number() over (
      partition by i.trip_id
      order by s.score desc, i.last_voted_at desc nulls last, i.created_at desc, i.id
    ) as top_rank,
    (
      select v.value from public.votes v
      where v.idea_id = i.id and v.user_id = (select auth.uid())
    ) as my_vote,
    (select count(*)::int from public.comments c where c.idea_id = i.id) as comment_count,
    extensions.st_x(extensions.st_pointonsurface(i.geom)) as lon,
    extensions.st_y(extensions.st_pointonsurface(i.geom)) as lat,
    extensions.st_asgeojson(i.geom, 6)::jsonb as shape,
    case
      when extensions.geometrytype(i.geom) = 'LINESTRING'
        then extensions.st_length(i.geom::extensions.geography)
    end as length_m
  from public.ideas i
  join public.idea_scores s on s.idea_id = i.id
  left join public.profiles p on p.id = i.author_id
) r;

create view public.trip_stages
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
  st.updated_at
from public.stages st;

create function public.cast_vote(p_idea_id uuid, p_value text)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_current text;
begin
  if p_value is null or p_value not in ('fire', 'up', 'down') then
    raise exception 'Unknown vote value: %', p_value using errcode = 'invalid_parameter_value';
  end if;

  select value into v_current
  from public.votes
  where idea_id = p_idea_id and user_id = (select auth.uid())
  for update;

  if v_current = p_value then
    delete from public.votes
    where idea_id = p_idea_id and user_id = (select auth.uid());
    return null;
  end if;

  insert into public.votes (idea_id, user_id, value)
  values (p_idea_id, (select auth.uid()), p_value)
  on conflict (idea_id, user_id) do update set value = excluded.value;
  return p_value;
end;
$$;

create function public.plant_idea(
  p_trip_id uuid,
  p_kind text,
  p_title text,
  p_note text default null,
  p_source_url text default null,
  p_stage_id uuid default null,
  p_lon double precision default null,
  p_lat double precision default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if (p_lon is null) <> (p_lat is null)
    or p_lon not between -180 and 180
    or p_lat not between -90 and 90
  then
    raise exception 'Invalid coordinates' using errcode = 'invalid_parameter_value';
  end if;

  insert into public.ideas (trip_id, author_id, kind, title, note, source_url, stage_id, geom)
  values (
    p_trip_id,
    (select auth.uid()),
    p_kind,
    trim(p_title),
    nullif(trim(p_note), ''),
    nullif(trim(p_source_url), ''),
    p_stage_id,
    case
      when p_lon is not null
        then extensions.st_setsrid(extensions.st_makepoint(p_lon, p_lat), 4326)
    end
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on public.stages, public.comments, public.trip_ideas, public.trip_stages from anon;
revoke execute on function public.cast_vote(uuid, text),
  public.plant_idea(uuid, text, text, text, text, uuid, double precision, double precision)
  from public, anon;
grant execute on function public.cast_vote(uuid, text),
  public.plant_idea(uuid, text, text, text, text, uuid, double precision, double precision)
  to authenticated;

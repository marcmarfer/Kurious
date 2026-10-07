create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '' check (char_length(name) <= 80),
  avatar_url text check (avatar_url is null or avatar_url ~ '^https?://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, left(coalesce(trim(new.raw_user_meta_data ->> 'name'), ''), 80));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  starts_on date,
  ends_on date,
  area extensions.geometry (Polygon, 4326),
  plant_in_forest boolean not null default false,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_on is null or ends_on is null or ends_on >= starts_on)
);

create table public.trip_members (
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'guest' check (role in ('owner', 'editor', 'guest')),
  joined_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

create index trip_members_user_id_idx on public.trip_members (user_id);

create function public.trip_role(p_trip_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.trip_members
  where trip_id = p_trip_id and user_id = auth.uid();
$$;

create function public.is_member(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.trip_members
    where trip_id = p_trip_id and user_id = auth.uid()
  );
$$;

create function public.shares_trip_with(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.trip_members mine
    join public.trip_members theirs on theirs.trip_id = mine.trip_id
    where mine.user_id = auth.uid() and theirs.user_id = p_user_id
  );
$$;

create function public.add_trip_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.created_by is not null then
    insert into public.trip_members (trip_id, user_id, role)
    values (new.id, new.created_by, 'owner');
  end if;
  return new;
end;
$$;

create trigger trips_add_owner
  after insert on public.trips
  for each row execute function public.add_trip_owner();

create function public.keep_an_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.role = 'owner'
    and (tg_op = 'DELETE' or new.role <> 'owner')
    and exists (select 1 from public.trips where id = old.trip_id)
    and not exists (
      select 1 from public.trip_members
      where trip_id = old.trip_id and role = 'owner' and user_id <> old.user_id
    )
  then
    raise exception 'A trip needs at least one owner' using errcode = 'check_violation';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger trip_members_keep_an_owner
  before update or delete on public.trip_members
  for each row execute function public.keep_an_owner();

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  kind text not null check (kind in ('place', 'route', 'food', 'random')),
  title text not null check (char_length(trim(title)) between 1 and 140),
  note text check (char_length(note) <= 2000),
  geom extensions.geometry (Geometry, 4326)
    check (geom is null or extensions.geometrytype(geom) in ('POINT', 'LINESTRING', 'POLYGON')),
  source_url text check (source_url is null or source_url ~ '^https?://'),
  last_voted_at timestamptz,
  withered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ideas_trip_id_idx on public.ideas (trip_id);
create index ideas_geom_idx on public.ideas using gist (geom);

create table public.votes (
  idea_id uuid not null references public.ideas (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  value text not null check (value in ('fire', 'up', 'down')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (idea_id, user_id)
);

create index votes_user_id_idx on public.votes (user_id);

create function public.ideas_keep_owner_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.trip_id := old.trip_id;
  new.author_id := old.author_id;
  new.created_at := old.created_at;
  return new;
end;
$$;

create trigger ideas_keep_owner_fields
  before update on public.ideas
  for each row execute function public.ideas_keep_owner_fields();

create function public.votes_keep_owner_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.idea_id := old.idea_id;
  new.user_id := old.user_id;
  new.created_at := old.created_at;
  return new;
end;
$$;

create trigger votes_keep_owner_fields
  before update on public.votes
  for each row execute function public.votes_keep_owner_fields();

create function public.touch_idea_on_vote()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.ideas
  set last_voted_at = now(), withered_at = null
  where id = coalesce(new.idea_id, old.idea_id);
  return null;
end;
$$;

create trigger votes_touch_idea
  after insert or update or delete on public.votes
  for each row execute function public.touch_idea_on_vote();

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trips_updated_at before update on public.trips
  for each row execute function public.set_updated_at();
create trigger ideas_updated_at before update on public.ideas
  for each row execute function public.set_updated_at();
create trigger votes_updated_at before update on public.votes
  for each row execute function public.set_updated_at();

create view public.idea_scores
with (security_invoker = true)
as
select
  c.idea_id,
  c.trip_id,
  c.fire,
  c.up,
  c.down,
  c.score,
  case
    when c.score >= 10 then 'araucaria'
    when c.score >= 5 then 'sapling'
    when c.score >= 2 then 'sprout'
    else 'seed'
  end as stage
from (
  select
    t.*,
    3 * t.fire + t.up - t.down as score
  from (
    select
      i.id as idea_id,
      i.trip_id,
      (count(*) filter (where v.value = 'fire'))::int as fire,
      (count(*) filter (where v.value = 'up'))::int as up,
      (count(*) filter (where v.value = 'down'))::int as down
    from public.ideas i
    left join public.votes v on v.idea_id = i.id
    group by i.id, i.trip_id
  ) t
) c;

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.ideas enable row level security;
alter table public.votes enable row level security;

create policy "profiles: read own and travel mates" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.shares_trip_with(id));
create policy "profiles: edit own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- INSERT ... RETURNING checks this before trips_add_owner has made the creator a member.
create policy "trips: members read" on public.trips
  for select to authenticated
  using (public.is_member(id) or created_by = (select auth.uid()));
create policy "trips: anyone signed in creates" on public.trips
  for insert to authenticated
  with check (created_by = (select auth.uid()));
create policy "trips: owner and editors edit" on public.trips
  for update to authenticated
  using (public.trip_role(id) in ('owner', 'editor'))
  with check (public.trip_role(id) in ('owner', 'editor'));
create policy "trips: owner deletes" on public.trips
  for delete to authenticated
  using (public.trip_role(id) = 'owner');

create policy "trip_members: members read" on public.trip_members
  for select to authenticated
  using (public.is_member(trip_id));
create policy "trip_members: owner adds" on public.trip_members
  for insert to authenticated
  with check (public.trip_role(trip_id) = 'owner');
create policy "trip_members: owner changes roles" on public.trip_members
  for update to authenticated
  using (public.trip_role(trip_id) = 'owner')
  with check (public.trip_role(trip_id) = 'owner');
create policy "trip_members: owner removes, anyone leaves" on public.trip_members
  for delete to authenticated
  using (public.trip_role(trip_id) = 'owner' or user_id = (select auth.uid()));

create policy "ideas: members read" on public.ideas
  for select to authenticated
  using (public.is_member(trip_id));
create policy "ideas: members add" on public.ideas
  for insert to authenticated
  with check (public.is_member(trip_id) and author_id = (select auth.uid()));
create policy "ideas: members edit" on public.ideas
  for update to authenticated
  using (public.is_member(trip_id))
  with check (public.is_member(trip_id));
create policy "ideas: members delete" on public.ideas
  for delete to authenticated
  using (public.is_member(trip_id));

create policy "votes: members read" on public.votes
  for select to authenticated
  using (exists (
    select 1 from public.ideas i
    where i.id = idea_id and public.is_member(i.trip_id)
  ));
create policy "votes: vote as yourself" on public.votes
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.ideas i
      where i.id = idea_id and public.is_member(i.trip_id)
    )
  );
create policy "votes: change own vote" on public.votes
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "votes: remove own vote" on public.votes
  for delete to authenticated
  using (user_id = (select auth.uid()));

revoke execute on function public.trip_role(uuid), public.is_member(uuid),
  public.shares_trip_with(uuid) from public, anon;
grant execute on function public.trip_role(uuid), public.is_member(uuid),
  public.shares_trip_with(uuid) to authenticated;
revoke execute on function public.handle_new_user(), public.add_trip_owner(),
  public.touch_idea_on_vote() from public, anon, authenticated;

create table public.trip_removals (
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  removed_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

create index trip_removals_user_id_idx on public.trip_removals (user_id);

alter table public.trip_removals enable row level security;

revoke all on public.trip_removals from anon, authenticated;

create function public.record_trip_removal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null
    and auth.uid() <> old.user_id
    and exists (select 1 from public.trips where id = old.trip_id)
  then
    insert into public.trip_removals (trip_id, user_id)
    values (old.trip_id, old.user_id)
    on conflict (trip_id, user_id) do update set removed_at = now();
  end if;
  return old;
end;
$$;

revoke execute on function public.record_trip_removal() from public, anon, authenticated;

create trigger trip_members_record_removal
  after delete on public.trip_members
  for each row execute function public.record_trip_removal();

create or replace function public.join_trip(p_token uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_trip_id uuid;
  v_created_at timestamptz;
begin
  if v_user is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;

  select trip_id, created_at into v_trip_id, v_created_at
  from public.trip_invites
  where token = p_token and expires_at > now();

  if v_trip_id is null then
    raise exception 'Invite not found or expired' using errcode = 'P0002';
  end if;

  if exists (
    select 1
    from public.trip_removals
    where trip_id = v_trip_id
      and user_id = v_user
      and removed_at >= v_created_at
  ) then
    raise exception 'Invite not valid for this person' using errcode = 'P0002';
  end if;

  insert into public.trip_members (trip_id, user_id, role)
  values (v_trip_id, v_user, 'guest')
  on conflict (trip_id, user_id) do nothing;

  return v_trip_id;
end;
$$;

create table public.trip_invites (
  token uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days'
);

create index trip_invites_trip_id_idx on public.trip_invites (trip_id);
create index trip_invites_created_by_idx on public.trip_invites (created_by);

alter table public.trip_invites enable row level security;

create policy "trip_invites: owner and editors read" on public.trip_invites
  for select to authenticated
  using (private.trip_role(trip_id) in ('owner', 'editor'));
create policy "trip_invites: owner and editors create" on public.trip_invites
  for insert to authenticated
  with check (
    private.trip_role(trip_id) in ('owner', 'editor')
    and created_by = (select auth.uid())
  );
create policy "trip_invites: owner and editors revoke" on public.trip_invites
  for delete to authenticated
  using (private.trip_role(trip_id) in ('owner', 'editor'));

create function public.join_trip(p_token uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_trip_id uuid;
begin
  if v_user is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;

  select trip_id into v_trip_id
  from public.trip_invites
  where token = p_token and expires_at > now();

  if v_trip_id is null then
    raise exception 'Invite not found or expired' using errcode = 'P0002';
  end if;

  insert into public.trip_members (trip_id, user_id, role)
  values (v_trip_id, v_user, 'guest')
  on conflict (trip_id, user_id) do nothing;

  return v_trip_id;
end;
$$;

revoke all on public.trip_invites from anon;
revoke execute on function public.join_trip(uuid) from public, anon;
grant execute on function public.join_trip(uuid) to authenticated;

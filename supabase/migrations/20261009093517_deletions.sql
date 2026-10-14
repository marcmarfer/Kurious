alter table public.ideas add column deleted_at timestamptz;

create index ideas_deleted_at_idx on public.ideas (deleted_at) where deleted_at is not null;

create function private.can_manage_idea(p_trip_id uuid, p_author_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_author_id = auth.uid()
    or private.trip_role(p_trip_id) in ('owner', 'editor');
$$;

drop policy "ideas: members read" on public.ideas;
drop policy "ideas: members edit" on public.ideas;
drop policy "ideas: members delete" on public.ideas;

create policy "ideas: members read" on public.ideas
  for select to authenticated
  using (deleted_at is null and private.is_member(trip_id));
create policy "ideas: author, owner and editors edit" on public.ideas
  for update to authenticated
  using (private.can_manage_idea(trip_id, author_id))
  with check (private.can_manage_idea(trip_id, author_id));
create policy "ideas: author, owner and editors delete" on public.ideas
  for delete to authenticated
  using (private.can_manage_idea(trip_id, author_id));

create function public.delete_idea(p_idea_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_trip_id uuid;
begin
  select trip_id into v_trip_id
  from public.ideas
  where id = p_idea_id
    and deleted_at is null
    and private.can_manage_idea(trip_id, author_id);

  if v_trip_id is null then
    raise exception 'Idea not found or not allowed' using errcode = '42501';
  end if;

  update public.ideas set deleted_at = now() where id = p_idea_id;

  delete from public.ideas
  where trip_id = v_trip_id and deleted_at < now() - interval '1 day';

  return v_trip_id;
end;
$$;

create function public.restore_idea(p_idea_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_trip_id uuid;
begin
  update public.ideas
  set deleted_at = null
  where id = p_idea_id
    and deleted_at > now() - interval '1 day'
    and private.can_manage_idea(trip_id, author_id)
  returning trip_id into v_trip_id;

  if v_trip_id is null then
    raise exception 'Idea not found or not allowed' using errcode = '42501';
  end if;

  return v_trip_id;
end;
$$;

drop policy "comments: author deletes own" on public.comments;

create policy "comments: author or owner deletes" on public.comments
  for delete to authenticated
  using (
    author_id = (select auth.uid())
    or exists (
      select 1 from public.ideas i
      where i.id = idea_id and private.trip_role(i.trip_id) = 'owner'
    )
  );

drop policy "trip_members: owner removes, anyone leaves" on public.trip_members;

create policy "trip_members: owner removes others, others leave" on public.trip_members
  for delete to authenticated
  using (
    case
      when user_id = (select auth.uid()) then private.trip_role(trip_id) <> 'owner'
      else private.trip_role(trip_id) = 'owner'
    end
  );

create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_trip record;
  v_heir uuid;
begin
  if v_user is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;

  for v_trip in
    select trip_id from public.trip_members
    where user_id = v_user and role = 'owner'
  loop
    select user_id into v_heir
    from public.trip_members
    where trip_id = v_trip.trip_id and user_id <> v_user
    order by (role = 'owner') desc, (role = 'editor') desc, joined_at, user_id
    limit 1;

    if v_heir is null then
      delete from public.trips where id = v_trip.trip_id;
    else
      update public.trip_members set role = 'owner'
      where trip_id = v_trip.trip_id and user_id = v_heir;
    end if;
  end loop;

  delete from auth.users where id = v_user;
end;
$$;

revoke execute on function private.can_manage_idea(uuid, uuid) from public, anon;
grant execute on function private.can_manage_idea(uuid, uuid) to authenticated;
revoke execute on function public.delete_idea(uuid), public.restore_idea(uuid),
  public.delete_my_account()
  from public, anon;
grant execute on function public.delete_idea(uuid), public.restore_idea(uuid),
  public.delete_my_account()
  to authenticated;

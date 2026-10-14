create or replace function public.ideas_keep_owner_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.trip_id := old.trip_id;
  new.created_at := old.created_at;
  if not (new.author_id is null
    and old.author_id::text = coalesce(current_setting('kurious.erasing_user', true), '')) then
    new.author_id := old.author_id;
  end if;
  return new;
end;
$$;

create or replace function public.comments_keep_owner_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.idea_id := old.idea_id;
  new.created_at := old.created_at;
  if not (new.author_id is null
    and old.author_id::text = coalesce(current_setting('kurious.erasing_user', true), '')) then
    new.author_id := old.author_id;
  end if;
  return new;
end;
$$;

create or replace function public.delete_my_account()
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

  perform set_config('kurious.erasing_user', v_user::text, true);
  update public.ideas set author_id = null where author_id = v_user;
  update public.comments set author_id = null where author_id = v_user;
  update public.trips set created_by = null where created_by = v_user;

  delete from auth.users where id = v_user;
end;
$$;

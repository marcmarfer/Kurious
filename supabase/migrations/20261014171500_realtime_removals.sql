create function private.touch_trip()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    update public.trips set updated_at = now() where id = old.trip_id;
  else
    update public.trips set updated_at = now() where id = new.trip_id;
  end if;
  return null;
end;
$$;

create function private.touch_trip_from_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.trips set updated_at = now()
  where id = (select trip_id from public.ideas where id = old.idea_id);
  return null;
end;
$$;

create trigger stages_touch_trip after delete on public.stages
  for each row execute function private.touch_trip();
create trigger trip_members_touch_trip after delete on public.trip_members
  for each row execute function private.touch_trip();
create trigger ideas_touch_trip after update of deleted_at on public.ideas
  for each row when (new.deleted_at is not null and old.deleted_at is null)
  execute function private.touch_trip();
create trigger comments_touch_trip after delete on public.comments
  for each row execute function private.touch_trip_from_comment();

revoke execute on function private.touch_trip(), private.touch_trip_from_comment()
  from public, anon, authenticated;

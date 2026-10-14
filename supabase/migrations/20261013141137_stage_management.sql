create function public.add_stage(
  p_trip_id uuid,
  p_name text,
  p_starts_on date default null,
  p_ends_on date default null,
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

  insert into public.stages (trip_id, position, name, starts_on, ends_on, geom)
  values (
    p_trip_id,
    coalesce((select max(position) from public.stages where trip_id = p_trip_id), 0) + 1,
    trim(p_name),
    p_starts_on,
    p_ends_on,
    case
      when p_lon is not null
        then extensions.st_setsrid(extensions.st_makepoint(p_lon, p_lat), 4326)
    end
  )
  returning id into v_id;

  return v_id;
end;
$$;

create function public.move_stage(p_stage_id uuid, p_up boolean)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_trip_id uuid;
  v_position int;
  v_other_id uuid;
  v_other_position int;
begin
  select trip_id, position into v_trip_id, v_position
  from public.stages
  where id = p_stage_id;

  if v_trip_id is null then
    return false;
  end if;

  if p_up then
    select id, position into v_other_id, v_other_position
    from public.stages
    where trip_id = v_trip_id and position < v_position
    order by position desc
    limit 1;
  else
    select id, position into v_other_id, v_other_position
    from public.stages
    where trip_id = v_trip_id and position > v_position
    order by position
    limit 1;
  end if;

  if v_other_id is null then
    return false;
  end if;

  update public.stages set position = v_other_position where id = p_stage_id;
  update public.stages set position = v_position where id = v_other_id;
  return true;
end;
$$;

revoke execute on function
  public.add_stage(uuid, text, date, date, double precision, double precision),
  public.move_stage(uuid, boolean)
  from public, anon;
grant execute on function
  public.add_stage(uuid, text, date, date, double precision, double precision),
  public.move_stage(uuid, boolean)
  to authenticated;

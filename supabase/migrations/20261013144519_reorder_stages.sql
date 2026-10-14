create function public.reorder_stages(p_trip_id uuid, p_stage_ids uuid[])
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.stages s
  set position = o.position
  from unnest(p_stage_ids) with ordinality as o (id, position)
  where s.id = o.id
    and s.trip_id = p_trip_id
    and s.position <> o.position;
$$;

revoke execute on function public.reorder_stages(uuid, uuid[]) from public, anon;
grant execute on function public.reorder_stages(uuid, uuid[]) to authenticated;

create or replace view public.idea_scores
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
    when c.score >= greatest(6, ceil(0.75 * c.max_score)) then 'araucaria'
    when c.score >= greatest(4, ceil(0.40 * c.max_score)) then 'sapling'
    when c.score >= greatest(2, ceil(0.15 * c.max_score)) then 'sprout'
    else 'seed'
  end as stage,
  c.voters
from (
  select
    t.*,
    3 * t.fire + t.up - t.down as score,
    3 * greatest(t.voters, 2) as max_score
  from (
    select
      i.id as idea_id,
      i.trip_id,
      (count(v.*) filter (where v.value = 'fire'))::int as fire,
      (count(v.*) filter (where v.value = 'up'))::int as up,
      (count(v.*) filter (where v.value = 'down'))::int as down,
      (
        select count(distinct tv.user_id)::int
        from public.votes tv
        join public.ideas ti on ti.id = tv.idea_id
        where ti.trip_id = i.trip_id
      ) as voters
    from public.ideas i
    left join public.votes v on v.idea_id = i.id
    group by i.id, i.trip_id
  ) t
) c;

create or replace view public.trip_ideas
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
  case when r.top_rank = 1 and r.stage = 'araucaria' then 'fire' else r.stage end as growth,
  r.my_vote,
  r.comment_count,
  r.lon,
  r.lat,
  r.shape,
  r.length_m,
  r.voters
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
    s.voters,
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

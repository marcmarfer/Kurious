-- Policies reference these functions by OID, so moving them does not break them.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

alter function public.trip_role(uuid) set schema private;
alter function public.is_member(uuid) set schema private;
alter function public.shares_trip_with(uuid) set schema private;

create index trips_created_by_idx on public.trips (created_by);
create index ideas_author_id_idx on public.ideas (author_id);

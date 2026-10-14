import "server-only";
import { cache } from "react";
import { getCurrentUser } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  present,
  toComment,
  toIdea,
  toMembers,
  toRole,
  toStage,
  toTripSummary,
} from "./rows";
import type { Comment, Idea, Trip, TripSummary } from "./types";
import { isUuid } from "./validation";

export type MyTrip = TripSummary & { myRole: Trip["myRole"] };

export const getMyTrips = cache(async (): Promise<MyTrip[]> => {
  const user = await getCurrentUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trip_members")
    .select("role, trips(id, name, starts_on, ends_on, created_at)")
    .eq("user_id", user.id);
  if (error) throw error;

  return data
    .flatMap(({ role, trips }) => (trips ? [{ role, trip: trips }] : []))
    .sort((a, b) => b.trip.created_at.localeCompare(a.trip.created_at))
    .map(({ role, trip }) => ({
      ...toTripSummary(trip),
      myRole: toRole(role),
    }));
});

export const getTrip = cache(async (tripId: string): Promise<Trip | null> => {
  if (!isUuid(tripId)) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();

  const [trip, members, stages, ideas] = await Promise.all([
    supabase
      .from("trips")
      .select("id, name, starts_on, ends_on")
      .eq("id", tripId)
      .maybeSingle(),
    supabase.from("trip_members").select("user_id, role").eq("trip_id", tripId),
    supabase
      .from("trip_stages")
      .select("*")
      .eq("trip_id", tripId)
      .order("position"),
    supabase
      .from("trip_ideas")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false }),
  ]);
  for (const result of [trip, members, stages, ideas])
    if (result.error) throw result.error;

  const memberRows = members.data ?? [];
  const me = memberRows.find((member) => member.user_id === user.id);
  if (!trip.data || !me) return null;

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, name, avatar_url, traveler_tags, avatar_color")
    .in(
      "id",
      memberRows.map((member) => member.user_id),
    );
  if (error) throw error;

  return {
    ...toTripSummary(trip.data),
    myRole: toRole(me.role),
    members: toMembers(memberRows, profiles),
    stages: (stages.data ?? []).map(toStage).filter(present),
    ideas: (ideas.data ?? []).map(toIdea).filter(present),
  };
});

export const getIdea = cache(
  async (
    tripId: string,
    ideaId: string,
  ): Promise<{ trip: Trip; idea: Idea; comments: Comment[] } | null> => {
    if (!isUuid(ideaId)) return null;
    const trip = await getTrip(tripId);
    const idea = trip?.ideas.find((candidate) => candidate.id === ideaId);
    if (!trip || !idea) return null;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("comments")
      .select("id, idea_id, author_id, body, created_at")
      .eq("idea_id", ideaId)
      .order("created_at");
    if (error) throw error;

    const names = new Map(
      trip.members.map((member) => [member.id, member.name]),
    );
    return {
      trip,
      idea,
      comments: data.map((row) => toComment(row, names)),
    };
  },
);

export const getInvite = cache(
  async (
    tripId: string,
  ): Promise<{ token: string; expiresAt: string } | null> => {
    if (!isUuid(tripId)) return null;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("trip_invites")
      .select("token, expires_at")
      .eq("trip_id", tripId)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? { token: data.token, expiresAt: data.expires_at } : null;
  },
);

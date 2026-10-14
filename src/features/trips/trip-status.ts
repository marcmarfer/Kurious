import type { TripSummary } from "./types";

export type TripStatus = "active" | "done";

export function tripStatus(
  trip: Pick<TripSummary, "endsOn">,
  now: Date | number,
): TripStatus {
  const today = new Date(now).toISOString().slice(0, 10);
  return trip.endsOn && trip.endsOn < today ? "done" : "active";
}

export function splitTrips<T extends Pick<TripSummary, "endsOn">>(
  trips: T[],
  now: Date | number,
) {
  const active: T[] = [];
  const done: T[] = [];
  for (const trip of trips)
    (tripStatus(trip, now) === "done" ? done : active).push(trip);
  return { active, done };
}

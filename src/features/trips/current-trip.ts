import { isUuid } from "./validation";

export const CURRENT_TRIP_COOKIE = "kurious_trip";

export const CURRENT_TRIP_MAX_AGE = 60 * 60 * 24 * 365;

const TRIP_PATH = /^\/(?:(?:pt|en)\/)?trips\/([^/]+)/;

export function tripIdInPath(pathname: string): string | null {
  const id = TRIP_PATH.exec(pathname)?.[1];
  return isUuid(id) ? id : null;
}

export function pickCurrentTrip<T extends { id: string }>(
  trips: readonly T[],
  remembered: string | undefined,
  fallback: T | undefined,
): T | undefined {
  return trips.find((trip) => trip.id === remembered) ?? fallback;
}

export const TRAVELER_TAGS = [
  "adventure",
  "relax",
  "food",
  "culture",
  "nature",
  "beach",
  "mountains",
  "city",
  "nightlife",
  "photography",
  "budget",
  "comfort",
  "planner",
  "spontaneous",
  "early_riser",
  "road_trip",
] as const;

export type TravelerTag = (typeof TRAVELER_TAGS)[number];

export const MAX_TRAVELER_TAGS = 6;
export const MAX_PROFILE_NAME_LENGTH = 80;

function isTravelerTag(value: unknown): value is TravelerTag {
  return (TRAVELER_TAGS as readonly unknown[]).includes(value);
}

export function parseTravelerTags(values: readonly unknown[]): TravelerTag[] {
  return [...new Set(values.filter(isTravelerTag))].slice(0, MAX_TRAVELER_TAGS);
}

export type ProfileFieldError = "nameRequired" | "nameTooLong";

export function parseProfileName(
  raw: string,
): { ok: true; value: string } | { ok: false; error: ProfileFieldError } {
  const name = raw.trim();
  if (!name) return { ok: false, error: "nameRequired" };
  if (name.length > MAX_PROFILE_NAME_LENGTH)
    return { ok: false, error: "nameTooLong" };
  return { ok: true, value: name };
}

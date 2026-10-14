import { isIdeaKind } from "./growth";
import type { IdeaKind } from "./types";
import { isStageColor, type StageColor } from "./stage-colors";

export const MAX_TRIP_NAME_LENGTH = 120;
export const MAX_STAGE_NAME_LENGTH = 80;
export const MAX_IDEA_TITLE_LENGTH = 140;
export const MAX_NOTE_LENGTH = 2000;
export const MAX_COMMENT_LENGTH = 2000;
export const MAX_URL_LENGTH = 2048;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

export function isDay(value: string) {
  if (!DAY.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

type Result<T, K extends string, E extends string> =
  { ok: true; value: T } | { ok: false; errors: Partial<Record<K, E>> };

function result<T, K extends string, E extends string>(
  value: T,
  errors: Partial<Record<K, E>>,
): Result<T, K, E> {
  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, value };
}

export type TripFieldError =
  "nameRequired" | "nameTooLong" | "dateInvalid" | "endBeforeStart";

export type TripFields = "name" | "startsOn" | "endsOn";

export type TripInput = {
  name: string;
  startsOn: string | null;
  endsOn: string | null;
};

export function parseTrip(input: {
  name: string;
  startsOn: string;
  endsOn: string;
}): Result<TripInput, TripFields, TripFieldError> {
  const name = input.name.trim();
  const startsOn = input.startsOn.trim() || null;
  const endsOn = input.endsOn.trim() || null;
  const errors: Partial<Record<TripFields, TripFieldError>> = {};

  if (!name) errors.name = "nameRequired";
  else if (name.length > MAX_TRIP_NAME_LENGTH) errors.name = "nameTooLong";
  if (startsOn && !isDay(startsOn)) errors.startsOn = "dateInvalid";
  if (endsOn && !isDay(endsOn)) errors.endsOn = "dateInvalid";
  else if (startsOn && endsOn && !errors.startsOn && endsOn < startsOn)
    errors.endsOn = "endBeforeStart";

  return result({ name, startsOn, endsOn }, errors);
}

export type StageFieldError = TripFieldError | "placeInvalid";

export type StageFields = TripFields | "place";

export type StageInput = TripInput & {
  lon: number | null;
  lat: number | null;
  color: StageColor | null;
};

export function parseStage(input: {
  name: string;
  startsOn: string;
  endsOn: string;
  lon: string;
  lat: string;
  color: string;
}): Result<StageInput, StageFields, StageFieldError> {
  const name = input.name.trim();
  const startsOn = input.startsOn.trim() || null;
  const endsOn = input.endsOn.trim() || null;
  const lon = coordinate(input.lon, 180);
  const lat = coordinate(input.lat, 90);
  const errors: Partial<Record<StageFields, StageFieldError>> = {};

  if (!name) errors.name = "nameRequired";
  else if (name.length > MAX_STAGE_NAME_LENGTH) errors.name = "nameTooLong";
  if (startsOn && !isDay(startsOn)) errors.startsOn = "dateInvalid";
  if (endsOn && !isDay(endsOn)) errors.endsOn = "dateInvalid";
  else if (startsOn && endsOn && !errors.startsOn && endsOn < startsOn)
    errors.endsOn = "endBeforeStart";
  if (
    lon === undefined ||
    lat === undefined ||
    (lon === null) !== (lat === null)
  )
    errors.place = "placeInvalid";

  return result(
    {
      name,
      startsOn,
      endsOn,
      lon: lon ?? null,
      lat: lat ?? null,
      color: isStageColor(input.color) ? input.color : null,
    },
    errors,
  );
}

export type IdeaFieldError =
  | "kindInvalid"
  | "titleRequired"
  | "titleTooLong"
  | "noteTooLong"
  | "urlInvalid"
  | "stageInvalid"
  | "placeInvalid";

export type IdeaFields =
  "kind" | "title" | "note" | "sourceUrl" | "stageId" | "place";

export type IdeaInput = {
  kind: IdeaKind;
  title: string;
  note: string | null;
  sourceUrl: string | null;
  stageId: string | null;
  lon: number | null;
  lat: number | null;
};

export function parseIdea(input: {
  kind: string;
  title: string;
  note: string;
  sourceUrl: string;
  stageId: string;
  lon: string;
  lat: string;
}): Result<IdeaInput, IdeaFields, IdeaFieldError> {
  const errors: Partial<Record<IdeaFields, IdeaFieldError>> = {};
  const kind = input.kind.trim();
  const title = input.title.trim();
  const note = input.note.trim() || null;
  const sourceUrl = normalizeUrl(input.sourceUrl);
  const stageId = input.stageId.trim() || null;
  const lon = coordinate(input.lon, 180);
  const lat = coordinate(input.lat, 90);

  if (!isIdeaKind(kind)) errors.kind = "kindInvalid";
  if (!title) errors.title = "titleRequired";
  else if (title.length > MAX_IDEA_TITLE_LENGTH) errors.title = "titleTooLong";
  if (note && note.length > MAX_NOTE_LENGTH) errors.note = "noteTooLong";
  if (sourceUrl === undefined) errors.sourceUrl = "urlInvalid";
  if (stageId && !isUuid(stageId)) errors.stageId = "stageInvalid";
  if (
    lon === undefined ||
    lat === undefined ||
    (lon === null) !== (lat === null)
  )
    errors.place = "placeInvalid";

  return result(
    {
      kind: kind as IdeaKind,
      title,
      note,
      sourceUrl: sourceUrl ?? null,
      stageId,
      lon: lon ?? null,
      lat: lat ?? null,
    },
    errors,
  );
}

export function normalizeUrl(raw: string): string | null | undefined {
  const value = raw.trim();
  if (!value) return null;
  const withScheme = /^[a-z][a-z\d+.-]*:/i.test(value)
    ? value
    : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    if (!url.hostname.includes(".")) return undefined;
    const href = url.href;
    return href.length <= MAX_URL_LENGTH ? href : undefined;
  } catch {
    return undefined;
  }
}

function coordinate(raw: string, limit: number): number | null | undefined {
  const value = raw.trim();
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= limit
    ? number
    : undefined;
}

export function isMapPoint(lon: unknown, lat: unknown): boolean {
  return (
    typeof lon === "number" &&
    typeof lat === "number" &&
    Number.isFinite(lon) &&
    Number.isFinite(lat) &&
    Math.abs(lon) <= 180 &&
    Math.abs(lat) <= 90
  );
}

export type CommentFieldError = "bodyRequired" | "bodyTooLong";

export function parseComment(
  raw: string,
): Result<string, "body", CommentFieldError> {
  const body = raw.trim();
  if (!body) return { ok: false, errors: { body: "bodyRequired" } };
  if (body.length > MAX_COMMENT_LENGTH)
    return { ok: false, errors: { body: "bodyTooLong" } };
  return { ok: true, value: body };
}

export type IdeaEditFields = "title" | "note";

export type IdeaEditError = "titleRequired" | "titleTooLong" | "noteTooLong";

export function parseIdeaEdit(input: {
  title: string;
  note: string;
}): Result<
  { title: string; note: string | null },
  IdeaEditFields,
  IdeaEditError
> {
  const title = input.title.trim();
  const note = input.note.trim() || null;
  const errors: Partial<Record<IdeaEditFields, IdeaEditError>> = {};
  if (!title) errors.title = "titleRequired";
  else if (title.length > MAX_IDEA_TITLE_LENGTH) errors.title = "titleTooLong";
  if (note && note.length > MAX_NOTE_LENGTH) errors.note = "noteTooLong";
  return result({ title, note }, errors);
}

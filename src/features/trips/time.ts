const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export type TimeAgoKey =
  | "now"
  | "minutes"
  | "hours"
  | "yesterday"
  | "days"
  | "weeks"
  | "months"
  | "years";

export type TimeAgo = { key: TimeAgoKey; count: number };

export function timeAgo(date: string | Date, now: Date | number): TimeAgo {
  const elapsed = new Date(now).getTime() - new Date(date).getTime();
  if (!(elapsed >= MINUTE)) return { key: "now", count: 0 };
  if (elapsed < HOUR) return { key: "minutes", count: whole(elapsed, MINUTE) };
  if (elapsed < DAY) return { key: "hours", count: whole(elapsed, HOUR) };
  if (elapsed < 2 * DAY) return { key: "yesterday", count: 1 };
  if (elapsed < 7 * DAY) return { key: "days", count: whole(elapsed, DAY) };
  if (elapsed < 30 * DAY)
    return { key: "weeks", count: whole(elapsed, 7 * DAY) };
  if (elapsed < 365 * DAY)
    return { key: "months", count: whole(elapsed, 30 * DAY) };
  return { key: "years", count: whole(elapsed, 365 * DAY) };
}

function whole(ms: number, unit: number) {
  return Math.floor(ms / unit);
}

type Translate = (key: string, values?: Record<string, number>) => string;

export function formatTimeAgo(
  t: Translate,
  date: string | Date,
  now: Date | number,
) {
  const { key, count } = timeAgo(date, now);
  return t(`ago.${key}`, { count });
}

export const DAY_MONTH = {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
} as const;

export function parseDay(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date));
}

export function dayCount(startsOn: string | null, endsOn: string | null) {
  if (!startsOn || !endsOn) return null;
  return (
    Math.round(
      (parseDay(endsOn).getTime() - parseDay(startsOn).getTime()) / DAY,
    ) + 1
  );
}

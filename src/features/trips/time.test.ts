import { describe, expect, it } from "vitest";
import { dayCount, formatTimeAgo, parseDay, timeAgo } from "./time";

const NOW = new Date("2026-10-08T12:00:00.000Z");
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("timeAgo", () => {
  it.each([
    [0, "now", 0],
    [30_000, "now", 0],
    [-5 * MIN, "now", 0],
    [MIN, "minutes", 1],
    [25 * MIN, "minutes", 25],
    [3 * HOUR, "hours", 3],
    [23 * HOUR + 59 * MIN, "hours", 23],
    [26 * HOUR, "yesterday", 1],
    [2 * DAY, "days", 2],
    [6 * DAY + 4 * HOUR, "days", 6],
    [7 * DAY, "weeks", 1],
    [20 * DAY, "weeks", 2],
    [45 * DAY, "months", 1],
    [400 * DAY, "years", 1],
  ])("%d ms ago is %s %d", (ms, key, count) => {
    expect(timeAgo(ago(ms), NOW)).toEqual({ key, count });
  });

  it("treats an unreadable date as now", () => {
    expect(timeAgo("not a date", NOW)).toEqual({ key: "now", count: 0 });
  });

  it("asks the Time messages for the right key", () => {
    const calls: unknown[] = [];
    const t = (key: string, values?: Record<string, number>) => {
      calls.push([key, values]);
      return key;
    };
    expect(formatTimeAgo(t, ago(3 * HOUR), NOW)).toBe("ago.hours");
    expect(calls).toEqual([["ago.hours", { count: 3 }]]);
  });
});

describe("days", () => {
  it("reads a date column as a UTC day", () => {
    expect(parseDay("2027-01-12").toISOString()).toBe(
      "2027-01-12T00:00:00.000Z",
    );
  });

  it("counts both ends of a stage", () => {
    expect(dayCount("2027-01-12", "2027-01-14")).toBe(3);
    expect(dayCount("2027-01-15", "2027-01-15")).toBe(1);
    expect(dayCount("2027-01-30", "2027-02-01")).toBe(3);
    expect(dayCount(null, "2027-02-01")).toBeNull();
  });
});

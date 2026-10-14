import { describe, expect, it } from "vitest";
import { splitTrips, tripStatus } from "./trip-status";

const NOW = Date.UTC(2026, 9, 9, 12);

describe("tripStatus", () => {
  it("keeps trips without an end date active", () => {
    expect(tripStatus({ endsOn: null }, NOW)).toBe("active");
  });

  it("keeps a trip that ends today active", () => {
    expect(tripStatus({ endsOn: "2026-10-09" }, NOW)).toBe("active");
  });

  it("marks a trip that ended yesterday as done", () => {
    expect(tripStatus({ endsOn: "2026-10-08" }, NOW)).toBe("done");
  });
});

describe("splitTrips", () => {
  it("splits trips keeping their order", () => {
    const trips = [
      { id: "a", endsOn: "2027-08-28" },
      { id: "b", endsOn: "2025-01-10" },
      { id: "c", endsOn: null },
      { id: "d", endsOn: "2024-05-01" },
    ];
    const { active, done } = splitTrips(trips, NOW);
    expect(active.map((t) => t.id)).toEqual(["a", "c"]);
    expect(done.map((t) => t.id)).toEqual(["b", "d"]);
  });
});

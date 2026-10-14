import { describe, expect, it } from "vitest";
import { pickCurrentTrip, tripIdInPath } from "./current-trip";

const ID = "92cd8d67-6a7b-4145-b332-2518b8393430";

describe("tripIdInPath", () => {
  it("reads the trip from any page inside it, in any language", () => {
    expect(tripIdInPath(`/trips/${ID}`)).toBe(ID);
    expect(tripIdInPath(`/pt/trips/${ID}/group`)).toBe(ID);
  });

  it("ignores the list, the new trip page and other routes", () => {
    expect(tripIdInPath("/trips")).toBeNull();
    expect(tripIdInPath("/trips/new")).toBeNull();
    expect(tripIdInPath("/settings")).toBeNull();
  });
});

describe("pickCurrentTrip", () => {
  const trips = [{ id: "a" }, { id: "b" }];

  it("prefers the remembered trip when it still exists", () => {
    expect(pickCurrentTrip(trips, "b", trips[0])).toEqual({ id: "b" });
  });

  it("falls back when the remembered trip is gone", () => {
    expect(pickCurrentTrip(trips, "z", trips[0])).toEqual({ id: "a" });
    expect(pickCurrentTrip([], undefined, undefined)).toBeUndefined();
  });
});

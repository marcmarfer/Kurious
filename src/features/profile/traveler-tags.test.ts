import { describe, expect, it } from "vitest";
import {
  MAX_TRAVELER_TAGS,
  parseProfileName,
  parseTravelerTags,
  TRAVELER_TAGS,
} from "./traveler-tags";

describe("parseTravelerTags", () => {
  it("drops unknown and repeated tags", () => {
    expect(parseTravelerTags(["beach", "lava", "beach", 3, "food"])).toEqual([
      "beach",
      "food",
    ]);
  });

  it("keeps at most the allowed number", () => {
    expect(parseTravelerTags([...TRAVELER_TAGS])).toHaveLength(
      MAX_TRAVELER_TAGS,
    );
  });
});

describe("parseProfileName", () => {
  it("trims the name", () => {
    expect(parseProfileName("  Dakar ")).toEqual({ ok: true, value: "Dakar" });
  });

  it("rejects an empty or too long name", () => {
    expect(parseProfileName("   ")).toEqual({
      ok: false,
      error: "nameRequired",
    });
    expect(parseProfileName("a".repeat(81))).toEqual({
      ok: false,
      error: "nameTooLong",
    });
  });
});

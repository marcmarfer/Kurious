import { describe, expect, it } from "vitest";
import {
  applyVote,
  compareIdeas,
  GROWTH_ORDER,
  growthForScore,
  growthThresholds,
  growthStep,
  isIdeaKind,
  isVoteValue,
  KIND_COLORS,
  points,
  rawScore,
} from "./growth";
import type { Idea } from "./types";

function idea(overrides: Partial<Idea> & Pick<Idea, "id">): Idea {
  const fire = overrides.fire ?? 0;
  const up = overrides.up ?? 0;
  const down = overrides.down ?? 0;
  const score = 3 * fire + up - down;
  return {
    tripId: "trip",
    stageId: null,
    kind: "place",
    title: overrides.id,
    note: null,
    sourceUrl: null,
    authorId: null,
    authorName: "",
    createdAt: "2026-10-01T10:00:00.000Z",
    score,
    growth: growthForScore(score, 4),
    members: 4,
    myVote: null,
    commentCount: 0,
    lon: null,
    lat: null,
    shape: null,
    lengthM: null,
    ...overrides,
    fire,
    up,
    down,
  };
}

describe("points", () => {
  it("counts a fire as three, an up as one and a down as minus one", () => {
    expect(rawScore({ fire: 4, up: 1, down: 0 })).toBe(13);
    expect(points({ fire: 1, up: 3, down: 1 })).toBe(5);
  });

  it("never goes below zero", () => {
    expect(rawScore({ fire: 0, up: 0, down: 2 })).toBe(-2);
    expect(points({ fire: 0, up: 0, down: 2 })).toBe(0);
  });
});

describe("growth", () => {
  it("grows at the same scores as the database for a group of four", () => {
    expect(growthForScore(-1, 4)).toBe("seed");
    expect(growthForScore(1, 4)).toBe("seed");
    expect(growthForScore(2, 4)).toBe("sprout");
    expect(growthForScore(4, 4)).toBe("sprout");
    expect(growthForScore(5, 4)).toBe("sapling");
    expect(growthForScore(8, 4)).toBe("sapling");
    expect(growthForScore(9, 4)).toBe("araucaria");
  });

  it("asks a big group for more points than a small one", () => {
    expect(growthThresholds(12)).toEqual({
      sprout: 6,
      sapling: 15,
      araucaria: 27,
    });
    expect(growthThresholds(5)).toEqual({
      sprout: 3,
      sapling: 6,
      araucaria: 12,
    });
  });

  it("keeps a floor so one or two members cannot grow an idea at once", () => {
    expect(growthThresholds(0)).toEqual(growthThresholds(2));
    expect(growthThresholds(2)).toEqual({
      sprout: 2,
      sapling: 4,
      araucaria: 6,
    });
  });

  it("orders the stages from seed to fire", () => {
    expect(GROWTH_ORDER).toEqual([
      "seed",
      "sprout",
      "sapling",
      "araucaria",
      "fire",
    ]);
    expect(growthStep("sapling")).toBe(2);
    expect(growthStep("fire")).toBe(4);
  });
});

describe("kinds", () => {
  it("has a dot and an ink colour for every kind", () => {
    expect(Object.keys(KIND_COLORS).sort()).toEqual(
      ["food", "place", "random", "route"].sort(),
    );
    expect(KIND_COLORS.route).toEqual({ dot: "#8E4A2A", ink: "#8E4A2A" });
    expect(KIND_COLORS.food).toEqual({ dot: "#B8862C", ink: "#9A6F1E" });
  });

  it("recognises kinds and vote values", () => {
    expect(isIdeaKind("food")).toBe(true);
    expect(isIdeaKind("hotel")).toBe(false);
    expect(isVoteValue("fire")).toBe(true);
    expect(isVoteValue(null)).toBe(false);
  });
});

describe("applyVote", () => {
  const base = { fire: 3, up: 1, down: 0, myVote: null };

  it("adds a vote", () => {
    expect(applyVote(base, "fire")).toEqual({
      fire: 4,
      up: 1,
      down: 0,
      myVote: "fire",
    });
  });

  it("removes the vote when the same one is cast again", () => {
    expect(applyVote(applyVote(base, "up"), "up")).toEqual(base);
  });

  it("moves the vote to the new value", () => {
    expect(applyVote({ ...base, fire: 4, myVote: "fire" }, "down")).toEqual({
      fire: 3,
      up: 1,
      down: 1,
      myVote: "down",
    });
  });
});

describe("compareIdeas", () => {
  it("puts the idea on fire first even when tied on points", () => {
    const tied = [
      idea({ id: "a", fire: 3, up: 2 }),
      idea({ id: "b", fire: 3, up: 2, growth: "fire" }),
    ];
    expect([...tied].sort(compareIdeas).map((i) => i.id)).toEqual(["b", "a"]);
  });

  it("breaks ties by fires, then likes, then the newest", () => {
    const tied = [
      idea({ id: "old", up: 3, createdAt: "2026-10-01T00:00:00.000Z" }),
      idea({ id: "fire", fire: 1 }),
      idea({ id: "new", up: 3, createdAt: "2026-10-02T00:00:00.000Z" }),
    ];
    expect([...tied].sort(compareIdeas).map((i) => i.id)).toEqual([
      "fire",
      "new",
      "old",
    ]);
  });
});

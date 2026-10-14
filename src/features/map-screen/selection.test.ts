import { describe, expect, it } from "vitest";
import { growthForScore } from "@/features/trips/growth";
import type { Idea, Stage } from "@/features/trips/types";
import {
  filterIdeas,
  initialSelection,
  kindCounts,
  rankIdeas,
  selectionAfterFilter,
  stageIdeas,
} from "./selection";

function idea(overrides: Partial<Idea> & Pick<Idea, "id">): Idea {
  const fire = overrides.fire ?? 0;
  const up = overrides.up ?? 0;
  const score = 3 * fire + up;
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
    down: 0,
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
  };
}

const stage: Stage = {
  id: "s1",
  position: 1,
  name: "Rio",
  startsOn: null,
  endsOn: null,
  lon: -43.2,
  lat: -22.95,
  color: null,
};

const ideas = [
  idea({ id: "seed", kind: "food" }),
  idea({ id: "sprout", kind: "route", up: 3, stageId: "s1" }),
  idea({ id: "hot", kind: "route", fire: 4, up: 1, growth: "fire" }),
  idea({ id: "tree", kind: "place", fire: 3, up: 2, stageId: "s1" }),
];

describe("rankIdeas", () => {
  it("puts the idea on fire first and then sorts by points", () => {
    expect(rankIdeas(ideas).map((i) => i.id)).toEqual([
      "hot",
      "tree",
      "sprout",
      "seed",
    ]);
  });

  it("does not reorder the input", () => {
    rankIdeas(ideas);
    expect(ideas[0].id).toBe("seed");
  });
});

describe("filterIdeas and kindCounts", () => {
  it("keeps every idea for all and only one kind otherwise", () => {
    expect(filterIdeas(ideas, "all")).toHaveLength(4);
    expect(filterIdeas(ideas, "route").map((i) => i.id)).toEqual([
      "sprout",
      "hot",
    ]);
    expect(filterIdeas(ideas, "random")).toEqual([]);
  });

  it("counts every kind, including the empty ones", () => {
    expect(kindCounts(ideas)).toEqual({
      all: 4,
      place: 1,
      route: 2,
      food: 1,
      random: 0,
    });
    expect(kindCounts([])).toEqual({
      all: 0,
      place: 0,
      route: 0,
      food: 0,
      random: 0,
    });
  });
});

describe("initialSelection", () => {
  it("uses the requested idea when it belongs to the trip", () => {
    expect(initialSelection(ideas, "seed")).toBe("seed");
  });

  it("falls back to the top idea", () => {
    expect(initialSelection(ideas, null)).toBe("hot");
    expect(initialSelection(ideas, "someone-else")).toBe("hot");
  });

  it("selects nothing in an empty trip", () => {
    expect(initialSelection([], null)).toBeNull();
  });
});

describe("selectionAfterFilter", () => {
  it("keeps an idea that is still shown", () => {
    expect(selectionAfterFilter("hot", ideas, [stage], "route")).toBe("hot");
    expect(selectionAfterFilter("seed", ideas, [stage], "all")).toBe("seed");
  });

  it("drops an idea the filter hides", () => {
    expect(selectionAfterFilter("tree", ideas, [stage], "route")).toBeNull();
  });

  it("keeps a selected stage whatever the filter", () => {
    expect(selectionAfterFilter("s1", ideas, [stage], "food")).toBe("s1");
  });

  it("drops a selection that no longer exists", () => {
    expect(selectionAfterFilter("gone", ideas, [stage], "all")).toBeNull();
    expect(selectionAfterFilter(null, ideas, [stage], "all")).toBeNull();
  });
});

describe("stageIdeas", () => {
  it("returns the stage's ideas, best first", () => {
    expect(stageIdeas(ideas, "s1").map((i) => i.id)).toEqual([
      "tree",
      "sprout",
    ]);
    expect(stageIdeas(ideas, "nowhere")).toEqual([]);
  });
});

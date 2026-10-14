import { describe, expect, it } from "vitest";
import type { Idea, Stage } from "@/features/trips/types";
import {
  UNASSIGNED,
  groupWinner,
  openStageId,
  planGroups,
  rankIdeas,
  voteProgress,
} from "./plan-board";

const idea = (
  id: string,
  fire: number,
  up: number,
  extra: Partial<Idea> = {},
): Idea =>
  ({
    id,
    fire,
    up,
    down: 0,
    score: 3 * fire + up,
    growth: "seed",
    stageId: null,
    myVote: null,
    createdAt: `2026-10-0${id.length}T10:00:00.000Z`,
    ...extra,
  }) as Idea;

const stage = (
  id: string,
  startsOn: string | null = null,
  endsOn: string | null = null,
): Stage => ({
  id,
  position: 0,
  name: id,
  startsOn,
  endsOn,
  lon: null,
  lat: null,
  color: null,
});

describe("rankIdeas", () => {
  it("puts voted ideas by points first and unvoted seeds last, newest first", () => {
    const ranked = rankIdeas([
      idea("a", 0, 0),
      idea("b", 0, 1),
      idea("cc", 0, 0),
      idea("d", 1, 0),
    ]);
    expect(ranked.map((i) => i.id)).toEqual(["d", "b", "cc", "a"]);
  });
});

describe("planGroups", () => {
  it("keeps the stage order and adds a group for ideas without a known stage", () => {
    const groups = planGroups(
      [stage("rio"), stage("ilha")],
      [
        idea("a", 1, 0, { stageId: "ilha" }),
        idea("b", 0, 1, { stageId: "gone", myVote: "up" }),
        idea("c", 0, 0),
      ],
    );
    expect(groups.map((g) => g.key)).toEqual(["rio", "ilha", UNASSIGNED]);
    expect(groups[2].ideas.map((i) => i.id)).toEqual(["b", "c"]);
    expect(groups[2].pending).toBe(1);
  });

  it("leaves out the unassigned group when every idea has a stage", () => {
    expect(planGroups([stage("rio")], []).map((g) => g.key)).toEqual(["rio"]);
  });
});

describe("groupWinner", () => {
  it("is the first idea with votes, never a seed", () => {
    expect(groupWinner({ ideas: [idea("a", 0, 0)] })).toBeNull();
    expect(groupWinner({ ideas: [idea("a", 1, 0), idea("b", 0, 0)] })?.id).toBe(
      "a",
    );
  });
});

describe("voteProgress", () => {
  it("counts what I have voted and what is left", () => {
    expect(
      voteProgress([{ myVote: "up" }, { myVote: null }, { myVote: null }]),
    ).toEqual({ done: 1, total: 3, pending: 2 });
  });
});

describe("openStageId", () => {
  const stages = [
    stage("rio", "2026-07-12", "2026-07-16"),
    stage("ilha", "2026-07-17", "2026-07-20"),
  ];

  it("opens the stage you are in or the next one", () => {
    expect(openStageId(stages, "2026-07-01")).toBe("rio");
    expect(openStageId(stages, "2026-07-16")).toBe("rio");
    expect(openStageId(stages, "2026-07-18")).toBe("ilha");
  });

  it("falls back to the first stage without dates or after the trip", () => {
    expect(openStageId([stage("a"), stage("b")], "2026-07-18")).toBe("a");
    expect(openStageId(stages, "2026-08-01")).toBe("rio");
    expect(openStageId([], "2026-08-01")).toBeNull();
  });
});

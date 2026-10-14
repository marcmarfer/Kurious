import { describe, expect, it } from "vitest";
import { applyVote, type VoteState } from "@/features/trips/growth";
import type { Idea } from "@/features/trips/types";
import {
  liveGrowth,
  pointsToGrow,
  rivalScore,
  sourceHost,
} from "./idea-growth";

const tren = { growth: "fire", score: 13, members: 4 } as const;
const trenVotes: VoteState = { fire: 4, up: 1, down: 0, myVote: "fire" };

describe("rivalScore", () => {
  it("is the best score among the other ideas", () => {
    const ideas = [
      { id: "a", score: 13 },
      { id: "b", score: 11 },
      { id: "c", score: -2 },
    ] as Idea[];
    expect(rivalScore(ideas, "a")).toBe(11);
    expect(rivalScore(ideas, "b")).toBe(13);
  });

  it("is null when the idea is alone", () => {
    expect(rivalScore([{ id: "a", score: 3 }] as Idea[], "a")).toBeNull();
    expect(rivalScore([], "a")).toBeNull();
  });
});

describe("liveGrowth", () => {
  it("keeps the server growth while the votes are unchanged", () => {
    expect(liveGrowth(trenVotes, tren, 11)).toBe("fire");
    expect(
      liveGrowth(
        { fire: 0, up: 3, down: 0, myVote: null },
        {
          growth: "sprout",
          score: 3,
          members: 4,
        },
        13,
      ),
    ).toBe("sprout");
  });

  it("drops the fire when a rival overtakes the idea", () => {
    const removed = applyVote(trenVotes, "fire");
    expect(liveGrowth(removed, tren, 11)).toBe("araucaria");
    expect(liveGrowth(removed, tren, 9)).toBe("fire");
  });

  it("lights the fire when a vote makes the idea the top one", () => {
    const pao = { growth: "araucaria", score: 11, members: 4 } as const;
    const votes: VoteState = { fire: 3, up: 2, down: 0, myVote: "up" };
    expect(liveGrowth(applyVote(votes, "fire"), pao, 13)).toBe("fire");
    expect(liveGrowth(applyVote(votes, "fire"), pao, 14)).toBe("araucaria");
  });

  it("needs the minimum score to be on fire", () => {
    const idea = { growth: "sapling", score: 6, members: 5 } as const;
    const votes: VoteState = { fire: 1, up: 3, down: 0, myVote: null };
    expect(liveGrowth(applyVote(votes, "fire"), idea, null)).toBe("sapling");
  });

  it("follows the score thresholds without the fire", () => {
    const idea = { growth: "seed", score: 0, members: 4 } as const;
    const votes: VoteState = { fire: 0, up: 0, down: 0, myVote: null };
    expect(liveGrowth(applyVote(votes, "up"), idea, 13)).toBe("seed");
    expect(liveGrowth(applyVote(votes, "fire"), idea, 13)).toBe("sprout");
  });
});

describe("pointsToGrow", () => {
  it("counts the points to the next growth", () => {
    expect(pointsToGrow("seed", 0, 4)).toBe(2);
    expect(pointsToGrow("seed", -3, 4)).toBe(5);
    expect(pointsToGrow("sprout", 3, 4)).toBe(2);
    expect(pointsToGrow("sapling", 6, 4)).toBe(3);
    expect(pointsToGrow("sapling", 6, 12)).toBe(21);
  });

  it("has nothing left once the idea is an araucaria", () => {
    expect(pointsToGrow("araucaria", 10, 4)).toBeNull();
    expect(pointsToGrow("fire", 13, 4)).toBeNull();
  });
});

describe("sourceHost", () => {
  it("shows the host without www", () => {
    expect(sourceHost("https://www.serraverdeexpress.com.br")).toBe(
      "serraverdeexpress.com.br",
    );
    expect(sourceHost("http://pt.wikipedia.org/wiki/Praia")).toBe(
      "pt.wikipedia.org",
    );
  });

  it("ignores empty, broken and non-web links", () => {
    expect(sourceHost(null)).toBeNull();
    expect(sourceHost("not a url")).toBeNull();
    expect(sourceHost("javascript:alert(1)")).toBeNull();
  });
});

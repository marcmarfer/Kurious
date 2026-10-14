import {
  growthForScore,
  growthThresholds,
  rawScore,
  type VoteState,
} from "@/features/trips/growth";
import type { Growth, Idea } from "@/features/trips/types";

export function rivalScore(ideas: readonly Idea[], ideaId: string) {
  let best: number | null = null;
  for (const idea of ideas)
    if (idea.id !== ideaId && (best === null || idea.score > best))
      best = idea.score;
  return best;
}

export function liveGrowth(
  votes: VoteState,
  idea: Pick<Idea, "growth" | "score" | "members">,
  rival: number | null,
): Growth {
  const score = rawScore(votes);
  if (score === idea.score) return idea.growth;
  const growth = growthForScore(score, idea.members);
  if (growth === "araucaria") {
    if (rival === null || score > rival) return "fire";
    if (score === rival && (idea.growth === "fire" || score > idea.score))
      return "fire";
  }
  return growth;
}

export function pointsToGrow(growth: Growth, score: number, members: number) {
  const at = growthThresholds(members);
  const target =
    growth === "seed"
      ? at.sprout
      : growth === "sprout"
        ? at.sapling
        : growth === "sapling"
          ? at.araucaria
          : null;
  return target === null ? null : Math.max(1, target - score);
}

export function sourceHost(url: string | null) {
  if (!url) return null;
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "https:" && protocol !== "http:") return null;
    return hostname.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

import type { Growth, Idea, IdeaKind, Trip, VoteValue } from "./types";

export const IDEA_KINDS: readonly IdeaKind[] = [
  "place",
  "route",
  "food",
  "random",
];

export const VOTE_VALUES: readonly VoteValue[] = ["fire", "up", "down"];

export const GROWTH_ORDER: readonly Growth[] = [
  "seed",
  "sprout",
  "sapling",
  "araucaria",
  "fire",
];

export const KIND_COLORS: Record<IdeaKind, { dot: string; ink: string }> = {
  place: { dot: "#1D4736", ink: "#1D4736" },
  route: { dot: "#8E4A2A", ink: "#8E4A2A" },
  food: { dot: "#B8862C", ink: "#9A6F1E" },
  random: { dot: "#7FA65C", ink: "#5E7F3A" },
};

export const GROWTH_PIN_SIZE: Record<Growth, number> = {
  seed: 36,
  sprout: 38,
  sapling: 42,
  araucaria: 48,
  fire: 58,
};

export function isIdeaKind(value: unknown): value is IdeaKind {
  return IDEA_KINDS.includes(value as IdeaKind);
}

export function isVoteValue(value: unknown): value is VoteValue {
  return VOTE_VALUES.includes(value as VoteValue);
}

export function isGrowth(value: unknown): value is Growth {
  return GROWTH_ORDER.includes(value as Growth);
}

type Counts = Pick<Idea, "fire" | "up" | "down">;

export function rawScore({ fire, up, down }: Counts) {
  return 3 * fire + up - down;
}

export function points(counts: Counts) {
  return Math.max(0, rawScore(counts));
}

export function voteCount({ fire, up, down }: Counts) {
  return fire + up + down;
}

export function growthThresholds(members: number) {
  const max = 3 * Math.max(members, 2);
  return {
    sprout: Math.max(2, Math.ceil(0.15 * max)),
    sapling: Math.max(4, Math.ceil(0.4 * max)),
    araucaria: Math.max(6, Math.ceil(0.75 * max)),
  };
}

export function growthForScore(
  score: number,
  members: number,
): Exclude<Growth, "fire"> {
  const at = growthThresholds(members);
  if (score >= at.araucaria) return "araucaria";
  if (score >= at.sapling) return "sapling";
  if (score >= at.sprout) return "sprout";
  return "seed";
}

export function growthStep(growth: Growth) {
  return GROWTH_ORDER.indexOf(growth);
}

export type VoteState = Counts & { myVote: VoteValue | null };

export function applyVote(state: VoteState, value: VoteValue): VoteState {
  const next = { ...state };
  if (state.myVote) next[state.myVote] -= 1;
  next.myVote = state.myVote === value ? null : value;
  if (next.myVote) next[next.myVote] += 1;
  return next;
}

export function compareIdeas(a: Idea, b: Idea) {
  return (
    Number(b.growth === "fire") - Number(a.growth === "fire") ||
    b.score - a.score ||
    b.fire - a.fire ||
    b.up - a.up ||
    b.createdAt.localeCompare(a.createdAt) ||
    a.id.localeCompare(b.id)
  );
}

export function newestFirst(a: Idea, b: Idea) {
  return b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id);
}

export function isSeed(idea: Idea) {
  return voteCount(idea) === 0;
}

export function stageOf(
  trip: Pick<Trip, "stages">,
  idea: Pick<Idea, "stageId">,
) {
  return trip.stages.find((stage) => stage.id === idea.stageId) ?? null;
}

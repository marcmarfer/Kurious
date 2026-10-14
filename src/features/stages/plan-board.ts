import { compareIdeas, isSeed, newestFirst } from "@/features/trips/growth";
import type { Idea, Stage } from "@/features/trips/types";

export const UNASSIGNED = "none";

export type StageGroup = {
  key: string;
  stage: Stage | null;
  ideas: Idea[];
  pending: number;
};

export function rankIdeas(ideas: readonly Idea[]): Idea[] {
  const voted = ideas.filter((idea) => !isSeed(idea)).sort(compareIdeas);
  const seeds = ideas.filter(isSeed).sort(newestFirst);
  return [...voted, ...seeds];
}

function pendingCount(ideas: readonly Pick<Idea, "myVote">[]) {
  return ideas.filter((idea) => idea.myVote === null).length;
}

export function planGroups(
  stages: readonly Stage[],
  ideas: readonly Idea[],
): StageGroup[] {
  const known = new Set(stages.map((stage) => stage.id));
  const group = (key: string, stage: Stage | null, list: Idea[]) => {
    const ranked = rankIdeas(list);
    return { key, stage, ideas: ranked, pending: pendingCount(ranked) };
  };
  const groups = stages.map((stage) =>
    group(
      stage.id,
      stage,
      ideas.filter((idea) => idea.stageId === stage.id),
    ),
  );
  const unassigned = ideas.filter(
    (idea) => !idea.stageId || !known.has(idea.stageId),
  );
  return unassigned.length > 0
    ? [...groups, group(UNASSIGNED, null, unassigned)]
    : groups;
}

export function groupWinner(group: Pick<StageGroup, "ideas">) {
  const [first] = group.ideas;
  return first && !isSeed(first) ? first : null;
}

export function voteProgress(ideas: readonly Pick<Idea, "myVote">[]) {
  const pending = pendingCount(ideas);
  return { done: ideas.length - pending, total: ideas.length, pending };
}

export function openStageId(
  stages: readonly Pick<Stage, "id" | "startsOn" | "endsOn">[],
  today: string,
): string | null {
  const current = stages.find((stage) => {
    const last = stage.endsOn ?? stage.startsOn;
    return last !== null && last >= today;
  });
  return current?.id ?? stages[0]?.id ?? null;
}

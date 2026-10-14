import { compareIdeas, IDEA_KINDS } from "@/features/trips/growth";
import type { Idea, IdeaKind, Stage } from "@/features/trips/types";

export type KindFilter = "all" | IdeaKind;

export const KIND_FILTERS: readonly KindFilter[] = ["all", ...IDEA_KINDS];

export function rankIdeas(ideas: readonly Idea[]) {
  return [...ideas].sort(compareIdeas);
}

export function filterIdeas<T extends Pick<Idea, "kind">>(
  ideas: readonly T[],
  kind: KindFilter,
) {
  return kind === "all"
    ? [...ideas]
    : ideas.filter((idea) => idea.kind === kind);
}

export function kindCounts(ideas: readonly Pick<Idea, "kind">[]) {
  const counts = Object.fromEntries(
    KIND_FILTERS.map((kind) => [kind, 0]),
  ) as Record<KindFilter, number>;
  for (const idea of ideas) {
    counts.all += 1;
    counts[idea.kind] += 1;
  }
  return counts;
}

export function initialSelection(
  ideas: readonly Idea[],
  requested: string | null,
) {
  if (requested && ideas.some((idea) => idea.id === requested))
    return requested;
  return rankIdeas(ideas)[0]?.id ?? null;
}

export function selectionAfterFilter(
  selectedId: string | null,
  ideas: readonly Idea[],
  stages: readonly Stage[],
  kind: KindFilter,
) {
  if (!selectedId) return null;
  if (stages.some((stage) => stage.id === selectedId)) return selectedId;
  const idea = ideas.find((candidate) => candidate.id === selectedId);
  return idea && (kind === "all" || idea.kind === kind) ? selectedId : null;
}

export function stageIdeas(ideas: readonly Idea[], stageId: string) {
  return rankIdeas(ideas.filter((idea) => idea.stageId === stageId));
}

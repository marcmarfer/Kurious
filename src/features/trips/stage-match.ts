import type { Idea, Stage } from "./types";

const STAGE_REACH_KM = 150;

type Point = { lon: number | null; lat: number | null };

const EARTH_KM = 6371;
const rad = (degrees: number) => (degrees * Math.PI) / 180;

export function distanceKm(a: Point, b: Point): number | null {
  if (a.lon === null || a.lat === null || b.lon === null || b.lat === null)
    return null;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h));
}

export function nearestStage<T extends Point & { id: string }>(
  point: Point,
  stages: readonly T[],
  reachKm = STAGE_REACH_KM,
): T | null {
  let best: T | null = null;
  let bestKm = reachKm;
  for (const stage of stages) {
    const km = distanceKm(point, stage);
    if (km !== null && km <= bestKm) {
      best = stage;
      bestKm = km;
    }
  }
  return best;
}

export type StageSuggestion = { stage: Stage; ideas: Idea[] };

export function suggestStages(
  ideas: readonly Idea[],
  stages: readonly Stage[],
): StageSuggestion[] {
  const known = new Set(stages.map((stage) => stage.id));
  const byStage = new Map<string, Idea[]>();
  for (const idea of ideas) {
    if (idea.stageId && known.has(idea.stageId)) continue;
    const stage = nearestStage(idea, stages);
    if (!stage) continue;
    byStage.set(stage.id, [...(byStage.get(stage.id) ?? []), idea]);
  }
  return stages
    .filter((stage) => byStage.has(stage.id))
    .map((stage) => ({ stage, ideas: byStage.get(stage.id)! }));
}

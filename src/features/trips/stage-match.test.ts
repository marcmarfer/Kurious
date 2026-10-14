import { describe, expect, it } from "vitest";
import { distanceKm, nearestStage, suggestStages } from "./stage-match";
import type { Idea, Stage } from "./types";

const stage = (id: string, lon: number | null, lat: number | null): Stage => ({
  id,
  position: 1,
  name: id,
  startsOn: null,
  endsOn: null,
  lon,
  lat,
  color: null,
});

const idea = (
  id: string,
  lon: number | null,
  lat: number | null,
  stageId: string | null = null,
) => ({ id, lon, lat, stageId }) as Idea;

const RIO = stage("rio", -43.2, -22.9);
const IGUAZU = stage("iguazu", -54.6, -25.6);
const NOWHERE = stage("nowhere", null, null);

describe("distanceKm", () => {
  it("measures Rio to Iguazu at about 1,180 km", () => {
    expect(distanceKm(RIO, IGUAZU)).toBeGreaterThan(1150);
    expect(distanceKm(RIO, IGUAZU)).toBeLessThan(1210);
  });

  it("has no distance without a place", () => {
    expect(distanceKm(RIO, NOWHERE)).toBeNull();
  });
});

describe("nearestStage", () => {
  const stages = [RIO, IGUAZU, NOWHERE];

  it("picks the closest stage within reach", () => {
    expect(nearestStage({ lon: -43.1, lat: -22.95 }, stages)?.id).toBe("rio");
    expect(nearestStage({ lon: -54.4, lat: -25.7 }, stages)?.id).toBe("iguazu");
  });

  it("proposes nothing when every stage is far away or the point is missing", () => {
    expect(nearestStage({ lon: -60, lat: -3.1 }, stages)).toBeNull();
    expect(nearestStage({ lon: null, lat: null }, stages)).toBeNull();
  });
});

describe("suggestStages", () => {
  it("groups the ideas without a stage under the stage they fall next to", () => {
    const suggestions = suggestStages(
      [
        idea("ipanema", -43.2, -22.98),
        idea("lapa", -43.18, -22.91),
        idea("falls", -54.44, -25.69),
        idea("amazon", -60, -3.1),
        idea("sim-card", null, null),
        idea("already", -43.2, -22.9, "iguazu"),
      ],
      [RIO, IGUAZU],
    );

    expect(
      suggestions.map((item) => [item.stage.id, item.ideas.map((i) => i.id)]),
    ).toEqual([
      ["rio", ["ipanema", "lapa"]],
      ["iguazu", ["falls"]],
    ]);
  });

  it("treats an idea pointing at a deleted stage as unassigned", () => {
    expect(
      suggestStages([idea("ipanema", -43.2, -22.98, "gone")], [RIO]),
    ).toHaveLength(1);
  });
});

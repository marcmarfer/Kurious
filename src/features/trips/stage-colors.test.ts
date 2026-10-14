import { describe, expect, it } from "vitest";
import {
  STAGE_COLORS,
  STAGE_COLOR_KEYS,
  isStageColor,
  stageHex,
  stageHexById,
} from "./stage-colors";

describe("stage colours", () => {
  it("uses the colour the group picked", () => {
    expect(stageHex({ color: "berry" }, 0)).toBe(STAGE_COLORS.berry);
  });

  it("gives each stage its own colour by order until one is picked", () => {
    expect(stageHex({ color: null }, 0)).toBe(STAGE_COLORS.lagoon);
    expect(stageHex({ color: null }, 1)).toBe(STAGE_COLORS.plum);
    expect(stageHex({ color: null }, STAGE_COLOR_KEYS.length)).toBe(
      STAGE_COLORS.lagoon,
    );
  });

  it("keeps orange for the most voted idea", () => {
    expect(isStageColor("fire")).toBe(false);
    expect(isStageColor("orange")).toBe(false);
    expect(isStageColor("sky")).toBe(true);
  });

  it("looks colours up by stage", () => {
    const colors = stageHexById([
      { id: "a", color: null },
      { id: "b", color: "slate" },
    ]);
    expect(colors.get("a")).toBe(STAGE_COLORS.lagoon);
    expect(colors.get("b")).toBe(STAGE_COLORS.slate);
  });
});

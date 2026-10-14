export const STAGE_COLORS = {
  lagoon: "#226B7A",
  plum: "#5E4F8F",
  ochre: "#A35A12",
  berry: "#9C3A60",
  sky: "#2F62A6",
  forest: "#24533F",
  clay: "#A2432A",
  slate: "#4B5765",
} as const;

export type StageColor = keyof typeof STAGE_COLORS;

export const STAGE_COLOR_KEYS = Object.keys(STAGE_COLORS) as StageColor[];

export function isStageColor(value: unknown): value is StageColor {
  return typeof value === "string" && value in STAGE_COLORS;
}

export function stageColorKey(
  stage: { color: StageColor | null },
  index: number,
): StageColor {
  return (
    stage.color ??
    STAGE_COLOR_KEYS[Math.max(0, index) % STAGE_COLOR_KEYS.length]
  );
}

export function stageHex(stage: { color: StageColor | null }, index: number) {
  return STAGE_COLORS[stageColorKey(stage, index)];
}

export function stageHexById(
  stages: readonly { id: string; color: StageColor | null }[],
): Map<string, string> {
  return new Map(stages.map((stage, i) => [stage.id, stageHex(stage, i)]));
}

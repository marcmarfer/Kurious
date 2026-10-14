import { describe, expect, it } from "vitest";
import {
  arc,
  boundsOf,
  chooseLeads,
  stagePinHtml,
  STAGE_LEAD,
} from "./trip-markers";

describe("trip markers", () => {
  it("bounds every point", () => {
    expect(
      boundsOf([
        [-43.2, -22.9],
        [-48.5, -27.6],
        [-44.7, -23.2],
      ]),
    ).toEqual([
      [-48.5, -27.6],
      [-43.2, -22.9],
    ]);
    expect(boundsOf([])).toBeNull();
  });

  it("draws an arc that starts and ends on the stages", () => {
    const line = arc([
      [-43.2, -22.9],
      [-44.7, -23.2],
      [-49.3, -25.4],
    ]);
    expect(line[0]).toEqual([-43.2, -22.9]);
    expect(line.at(-1)).toEqual([-49.3, -25.4]);
    expect(new Set(line.map(String)).size).toBe(line.length);
  });

  it("keeps the default lead when tags do not touch", () => {
    const tags = [
      { x: 0, y: 0, w: 90, h: 28 },
      { x: 400, y: 0, w: 90, h: 28 },
    ];
    expect(chooseLeads(tags, [])).toEqual([STAGE_LEAD, STAGE_LEAD]);
  });

  it("moves a tag that would cover another one", () => {
    const tags = [
      { x: 0, y: 0, w: 110, h: 28 },
      { x: 20, y: 6, w: 90, h: 28 },
    ];
    const [first, second] = chooseLeads(tags, []);
    expect(first).toEqual(STAGE_LEAD);
    expect(second).not.toEqual(STAGE_LEAD);
  });

  it("escapes stage names", () => {
    expect(stagePinHtml(1, "<b>Rio</b>", false)).toContain(
      "&lt;b&gt;Rio&lt;/b&gt;",
    );
  });
});

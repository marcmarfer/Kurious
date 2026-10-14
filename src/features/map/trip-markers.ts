import { growthDrawing, scopeIds } from "@/components/tree-drawings";
import { GROWTH_PIN_SIZE } from "@/features/trips/growth";
import type { Geometry, Growth } from "@/features/trips/types";

export type LngLat = [number, number];

export const STAGE_LEAD: LngLat = [0, 30];

const PIN_SHADOW =
  "filter:drop-shadow(0 0 1.2px #fff) drop-shadow(0 0 1.2px #fff) drop-shadow(0 3px 3px rgba(20,30,20,.35))";

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

export function ideaPinHtml(
  id: string,
  growth: Growth,
  selected: boolean,
  stageColor?: string,
) {
  const w = Math.round(GROWTH_PIN_SIZE[growth] * (selected ? 1.18 : 1));
  const h = Math.round((w * 64) / 48);
  const hot = growth === "fire";
  const fill =
    stageColor ?? (hot ? "rgba(255,138,31,.35)" : "rgba(46,106,78,.28)");
  const outline = selected ? "0 0 0 2.5px #1D4736" : "0 0 0 1.5px #FCFBF6";
  const plate =
    selected || stageColor
      ? `<div style="position:absolute;left:50%;bottom:-4px;width:${Math.round(w * 0.86)}px;height:12px;margin-left:-${Math.round(w * 0.43)}px;border-radius:50%;background:${fill};box-shadow:${outline}"></div>`
      : "";
  return `<div style="position:relative;width:${w}px;height:${h}px">${plate}<div style="position:relative;width:100%;height:100%;${PIN_SHADOW}"><svg viewBox="0 0 48 64" width="100%" height="100%" aria-hidden="true" style="overflow:visible;display:block">${scopeIds(growthDrawing(growth, "big"), `m${id}-`)}</svg></div></div>`;
}

export function stagePinHtml(
  number: number,
  name: string,
  selected: boolean,
  [dx, dy]: LngLat = STAGE_LEAD,
  color = "#1D4736",
) {
  const bg = selected ? color : "rgba(252,251,246,.96)";
  const ink = selected ? "#FCFBF6" : "#1F2A24";
  const numBg = selected ? "#FCFBF6" : color;
  const numInk = selected ? color : "#FCFBF6";
  return `<div style="position:relative"><svg width="1" height="1" aria-hidden="true" style="position:absolute;left:50%;top:50%;overflow:visible;pointer-events:none"><line x1="0" y1="0" x2="${-dx}" y2="${-dy}" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/><circle cx="${-dx}" cy="${-dy}" r="4.2" fill="#FCFBF6" stroke="${color}" stroke-width="2.4"/></svg><div style="position:relative;display:flex;align-items:center;gap:6px;padding:3px 10px 3px 3px;border-radius:14px;background:${bg};box-shadow:0 3px 10px rgba(20,30,20,.25);white-space:nowrap"><span style="width:22px;height:22px;border-radius:11px;background:${numBg};color:${numInk};display:flex;align-items:center;justify-content:center;font:800 11.5px/1 var(--font-nunito),sans-serif">${number}</span><span style="font:600 13.5px/1 var(--font-fraunces),serif;color:${ink}">${escapeHtml(name)}</span></div></div>`;
}

export function arc(points: LngLat[], bend = 0.16): LngLat[] {
  const toMerc = ([lon, lat]: LngLat): LngLat => [
    lon,
    (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)),
  ];
  const fromMerc = ([x, y]: LngLat): LngLat => [
    x,
    (360 / Math.PI) * Math.atan(Math.exp((y * Math.PI) / 180)) - 90,
  ];
  const out: LngLat[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = toMerc(points[i]);
    const b = toMerc(points[i + 1]);
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const cx = (a[0] + b[0]) / 2 - dy * bend;
    const cy = (a[1] + b[1]) / 2 + dx * bend;
    const n = Math.max(12, Math.round(Math.hypot(dx, dy) * 14));
    for (let t = i ? 1 : 0; t <= n; t++) {
      const u = t / n;
      const v = 1 - u;
      const [lon, lat] = fromMerc([
        v * v * a[0] + 2 * v * u * cx + u * u * b[0],
        v * v * a[1] + 2 * v * u * cy + u * u * b[1],
      ]);
      out.push([Math.round(lon * 1e5) / 1e5, Math.round(lat * 1e5) / 1e5]);
    }
  }
  return out;
}

export function shapeCoords(shape: Geometry | null): LngLat[] {
  if (!shape) return [];
  if (shape.type === "Point") return [shape.coordinates];
  if (shape.type === "LineString") return shape.coordinates;
  return shape.coordinates.flat();
}

export type Bounds = [LngLat, LngLat];

export function boundsOf(points: LngLat[]): Bounds | null {
  if (points.length === 0) return null;
  let [w, s] = points[0];
  let [e, n] = points[0];
  for (const [lon, lat] of points) {
    w = Math.min(w, lon);
    e = Math.max(e, lon);
    s = Math.min(s, lat);
    n = Math.max(n, lat);
  }
  return [
    [w, s],
    [e, n],
  ];
}

export type Box = { x: number; y: number; w: number; h: number };

const overlap = (a: Box, b: Box) =>
  Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) *
  Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

function leadOptions(w: number): LngLat[] {
  const side = Math.round(w / 2 + 26);
  return [
    STAGE_LEAD,
    [-side, -10],
    [side, -10],
    [0, 58],
    [-Math.round(w / 2 + 6), 36],
    [Math.round(w / 2 + 6), 36],
  ];
}

export function chooseLeads(
  tags: { x: number; y: number; w: number; h: number }[],
  obstacles: Box[],
): LngLat[] {
  const placed: Box[] = [];
  return tags.map((tag) => {
    let best: { lead: LngLat; box: Box; cost: number } | null = null;
    leadOptions(tag.w).forEach((lead, rank) => {
      const box = {
        x: tag.x + lead[0] - tag.w / 2,
        y: tag.y + lead[1] - tag.h / 2,
        w: tag.w,
        h: tag.h,
      };
      const cost =
        placed.reduce((sum, other) => sum + 4 * overlap(box, other), 0) +
        obstacles.reduce((sum, other) => sum + overlap(box, other), 0) +
        rank * 40;
      if (!best || cost < best.cost) best = { lead, box, cost };
    });
    placed.push(best!.box);
    return best!.lead;
  });
}

export const MAP_STYLE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
  "https://tiles.openfreemap.org/styles/liberty";

export const MAP_WORKER_URL = "/vendor/maplibre-gl/maplibre-gl-worker.mjs";

export const INITIAL_VIEW = {
  center: [-49.27, -25.43] as [number, number],
  zoom: 8,
};

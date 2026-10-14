import { validateStyleMin } from "@maplibre/maplibre-gl-style-spec";
import { describe, expect, it } from "vitest";
import {
  kuriousStyle,
  OVERLAY,
  overlayLayers,
  overlaySources,
} from "./kurious-style";

const OPENMAPTILES = [
  "water",
  "landcover",
  "landuse",
  "park",
  "transportation",
  "transportation_name",
  "place",
  "boundary",
  "waterway",
  "water_name",
  "mountain_peak",
  "aeroway",
];

describe("kuriousStyle", () => {
  it.each(["es", "pt", "en"])("is a valid MapLibre style (%s)", (locale) => {
    expect(validateStyleMin(kuriousStyle(locale))).toEqual([]);
  });

  it("stays valid with the trip overlay added", () => {
    const style = kuriousStyle();
    const withOverlay = {
      ...style,
      sources: { ...style.sources, ...overlaySources() },
      layers: [...style.layers, ...overlayLayers()],
    };
    expect(validateStyleMin(withOverlay)).toEqual([]);
  });

  it("reads only OpenMapTiles source layers", () => {
    const used = new Set(
      kuriousStyle()
        .layers.map((layer) =>
          "source-layer" in layer ? layer["source-layer"] : undefined,
        )
        .filter(Boolean),
    );
    expect([...used].every((name) => OPENMAPTILES.includes(name!))).toBe(true);
  });

  it("has unique layer ids, overlay included", () => {
    const ids = [...kuriousStyle().layers, ...overlayLayers()].map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("draws the overlay from its own sources", () => {
    const sources = Object.keys(overlaySources());
    expect(sources).toEqual([OVERLAY.route, OVERLAY.shapes]);
    for (const layer of overlayLayers()) {
      expect(sources).toContain("source" in layer ? layer.source : "");
    }
  });
});

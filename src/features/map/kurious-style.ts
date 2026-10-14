import type {
  ExpressionSpecification,
  LayerSpecification,
  SourceSpecification,
  StyleSpecification,
} from "maplibre-gl";

const KMAP = {
  seaLow: "#56A6D9",
  sea: "#63B4DF",
  shallow: "#7FD0DA",
  lake: "#7CC3E6",
  waterLabel: "#1F5F86",
  riverLabel: "#2E73A0",
  land: "#F4F0DC",
  forest: "#7DBB5E",
  forestHi: "#5FA548",
  grass: "#C9E29B",
  crop: "#ECE6C2",
  wetland: "#A9D9B6",
  sand: "#F6E2A8",
  rock: "#DDD5C3",
  urban: "#EFE4D6",
  park: "#B7DC8F",
  parkLine: "#6FA84F",
  road: "#FFFFFF",
  roadLow: "#FBF7EC",
  roadCase: "#D8CDB8",
  major: "#FFE6A3",
  majorCase: "#D9B266",
  majorLow: "#F1C877",
  path: "#B79E82",
  rail: "#7C5A45",
  ferry: "#4B93C4",
  hot: "#F26B1D",
  shape: "#8E4A2A",
  route: "#C4572A",
  boundary: "#A08F79",
  city: "#1F2A24",
  village: "#56625A",
  halo: "#FCFBF6",
  peak: "#6B5A48",
  roadLabel: "#6B6258",
  state: "rgba(140,122,98,0.85)",
} as const;

const TILES_URL = "https://tiles.openfreemap.org/planet";
const GLYPHS_URL =
  "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";
const TERRARIUM_URL =
  "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";

const FONT = {
  regular: ["Noto Sans Regular"],
  bold: ["Noto Sans Bold"],
  italic: ["Noto Sans Italic"],
};

const SRC = "openmaptiles";

type Stops = (number | string | ExpressionSpecification)[];

const z = (stops: Stops) =>
  ["interpolate", ["linear"], ["zoom"], ...stops] as ExpressionSpecification;

const zx = (base: number, stops: Stops) =>
  [
    "interpolate",
    ["exponential", base],
    ["zoom"],
    ...stops,
  ] as ExpressionSpecification;

const cls = ["get", "class"] as ExpressionSpecification;

const isClass = (...values: string[]) =>
  ["match", cls, values, true, false] as ExpressionSpecification;

const TUNNEL = ["==", ["get", "brunnel"], "tunnel"] as ExpressionSpecification;

const ROAD_MAJOR = ["motorway", "trunk"];
const ROAD_MINOR = ["minor", "service", "busway"];
const ROADS = [
  ...ROAD_MAJOR,
  "primary",
  "secondary",
  "tertiary",
  ...ROAD_MINOR,
];
const TRACKS = ["path", "track"];

function roadWidth(extra: number) {
  const m = (mw: number, pr: number, se: number, te: number, mi: number) =>
    [
      "+",
      [
        "match",
        cls,
        ROAD_MAJOR,
        mw,
        "primary",
        pr,
        "secondary",
        se,
        "tertiary",
        te,
        mi,
      ],
      ["case", ["==", ["get", "ramp"], 1], -0.3 * mw, 0],
      extra,
    ] as ExpressionSpecification;
  return zx(1.5, [
    5,
    m(0.9, 0.5, 0.4, 0.3, 0.2),
    7,
    m(1.3, 0.9, 0.6, 0.5, 0.3),
    9,
    m(2, 1.5, 1.1, 0.8, 0.5),
    11,
    m(3, 2.5, 2, 1.6, 0.9),
    13,
    m(6, 5, 4.2, 3.6, 2.4),
    15,
    m(13, 11, 9, 8, 6),
  ]);
}

function name(locale: string) {
  return [
    "coalesce",
    ["get", `name:${locale}`],
    ["get", "name"],
  ] as ExpressionSpecification;
}

const HALO = {
  "text-halo-color": KMAP.halo,
  "text-halo-width": 1.6,
  "text-halo-blur": 0.4,
};

function landLayers(): LayerSpecification[] {
  const cover: [string, string | ExpressionSpecification][] = [
    ["farmland", KMAP.crop],
    ["grass", KMAP.grass],
    ["rock", KMAP.rock],
    ["sand", KMAP.sand],
    ["wetland", KMAP.wetland],
    ["ice", "#FFFFFF"],
    ["wood", z([8, KMAP.forest, 12, KMAP.forestHi])],
  ];
  return [
    {
      id: "land",
      type: "background",
      paint: { "background-color": KMAP.land },
    },
    ...cover.map(([value, color]): LayerSpecification => ({
      id: `landcover-${value}`,
      type: "fill",
      source: SRC,
      "source-layer": "landcover",
      filter: ["==", cls, value],
      paint: { "fill-color": color },
    })),
    {
      id: "landuse",
      type: "fill",
      source: SRC,
      "source-layer": "landuse",
      filter: isClass(
        "residential",
        "commercial",
        "industrial",
        "retail",
        "cemetery",
        "military",
        "pitch",
        "playground",
        "stadium",
        "theme_park",
        "zoo",
      ),
      paint: {
        "fill-color": [
          "match",
          cls,
          "cemetery",
          "#DCE3C4",
          ["pitch", "playground", "stadium"],
          "#D6EBB0",
          ["theme_park", "zoo"],
          "#CFE6A6",
          "military",
          "#E6DDD2",
          KMAP.urban,
        ],
        "fill-opacity": 0.9,
      },
    },
    {
      id: "park",
      type: "fill",
      source: SRC,
      "source-layer": "park",
      paint: {
        "fill-color": KMAP.park,
        "fill-opacity": z([
          5,
          ["match", cls, "park", 0.85, 0.2],
          12,
          ["match", cls, "park", 0.85, 0.28],
        ]),
      },
    },
    {
      id: "park-outline",
      type: "line",
      source: SRC,
      "source-layer": "park",
      minzoom: 5,
      filter: ["!=", cls, "park"],
      paint: {
        "line-color": KMAP.parkLine,
        "line-width": z([5, 0.7, 9, 1.1, 13, 1.6]),
        "line-opacity": 0.55,
        "line-blur": 0.4,
      },
    },
  ];
}

function waterLayers(locale: string): LayerSpecification[] {
  return [
    {
      id: "water",
      type: "fill",
      source: SRC,
      "source-layer": "water",
      paint: {
        "fill-color": z([
          3,
          ["match", cls, "ocean", KMAP.seaLow, KMAP.lake],
          7,
          ["match", cls, "ocean", KMAP.sea, KMAP.lake],
        ]),
      },
    },
    {
      id: "water-shallow",
      type: "line",
      source: SRC,
      "source-layer": "water",
      filter: ["==", cls, "ocean"],
      layout: { "line-join": "round" },
      paint: {
        "line-color": KMAP.shallow,
        "line-opacity": 0.85,
        "line-width": z([3, 3, 6, 6, 9, 9, 13, 6, 15, 7]),
        "line-offset": z([3, 1.5, 6, 3, 9, 4.5, 13, 3, 15, 3.5]),
        "line-blur": z([3, 3, 6, 6, 9, 8, 13, 4, 15, 4]),
      },
    },
    {
      id: "waterway",
      type: "line",
      source: SRC,
      "source-layer": "waterway",
      filter: ["!", TUNNEL],
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": KMAP.lake,
        "line-width": zx(1.4, [
          5,
          ["match", cls, "river", 0.6, 0],
          9,
          ["match", cls, "river", 1.3, 0.3],
          12,
          ["match", cls, "river", 2.4, 0.6],
          15,
          ["match", cls, "river", 6, 1.8],
        ]),
      },
    },
    {
      id: "hillshade",
      type: "hillshade",
      source: "terrain",
      maxzoom: 15,
      paint: {
        "hillshade-exaggeration": z([5, 0.32, 10, 0.45, 14, 0.3]),
        "hillshade-shadow-color": "rgba(74, 62, 40, 0.42)",
        "hillshade-highlight-color": "rgba(255, 252, 236, 0.28)",
        "hillshade-accent-color": "rgba(74, 62, 40, 0.16)",
        "hillshade-illumination-direction": 315,
      },
    },
    {
      id: "water-label",
      type: "symbol",
      source: SRC,
      "source-layer": "water_name",
      layout: {
        "text-field": name(locale),
        "text-font": FONT.italic,
        "text-max-width": 7,
        "text-padding": 4,
        "text-size": z([
          3,
          ["match", cls, "ocean", 12, 11],
          8,
          ["match", cls, "ocean", 15, "bay", 11.5, 11],
          12,
          ["match", cls, "ocean", 15, "bay", 13.5, 11],
        ]),
        "text-letter-spacing": ["match", cls, "ocean", 0.3, 0.06],
      },
      paint: {
        "text-color": KMAP.waterLabel,
        "text-halo-color": "rgba(255,255,255,0.55)",
        "text-halo-width": 1.2,
      },
    },
  ];
}

function lineLayers(): LayerSpecification[] {
  return [
    {
      id: "boundary",
      type: "line",
      source: SRC,
      "source-layer": "boundary",
      filter: [
        "all",
        ["<=", ["get", "admin_level"], 4],
        ["!=", ["get", "maritime"], 1],
      ],
      paint: {
        "line-color": KMAP.boundary,
        "line-opacity": ["match", ["get", "admin_level"], 2, 0.65, 0.5],
        "line-width": z([
          3,
          ["match", ["get", "admin_level"], 2, 1, 0.7],
          9,
          ["match", ["get", "admin_level"], 2, 1.8, 1.4],
          13,
          ["match", ["get", "admin_level"], 2, 2.2, 2],
        ]),
        "line-dasharray": [3, 2],
      },
    },
    {
      id: "aeroway",
      type: "line",
      source: SRC,
      "source-layer": "aeroway",
      minzoom: 11,
      filter: ["==", cls, "runway"],
      paint: {
        "line-color": "#D2C9B5",
        "line-width": zx(1.6, [11, 2, 15, 22]),
      },
    },
    {
      id: "road-case",
      type: "line",
      source: SRC,
      "source-layer": "transportation",
      minzoom: 8.5,
      filter: isClass(...ROADS),
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": ["match", cls, ROAD_MAJOR, KMAP.majorCase, KMAP.roadCase],
        "line-width": roadWidth(1.6),
        "line-opacity": z([8.5, 0, 9.5, ["case", TUNNEL, 0.4, 1]]),
      },
    },
    {
      id: "road-path",
      type: "line",
      source: SRC,
      "source-layer": "transportation",
      minzoom: 12,
      filter: isClass(...TRACKS),
      paint: {
        "line-color": KMAP.path,
        "line-width": z([
          13,
          ["match", cls, "track", 1.1, 0.9],
          16,
          ["match", cls, "track", 2, 1.6],
        ]),
        "line-dasharray": [2.5, 1.6],
      },
    },
    {
      id: "road",
      type: "line",
      source: SRC,
      "source-layer": "transportation",
      filter: isClass(...ROADS),
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": z([
          8.5,
          ["match", cls, ROAD_MAJOR, KMAP.majorLow, KMAP.roadLow],
          10,
          ["match", cls, ROAD_MAJOR, KMAP.major, KMAP.road],
        ]),
        "line-width": roadWidth(0),
        "line-opacity": ["case", TUNNEL, 0.55, 1],
      },
    },
    {
      id: "rail",
      type: "line",
      source: SRC,
      "source-layer": "transportation",
      filter: isClass("rail", "transit"),
      paint: {
        "line-color": KMAP.rail,
        "line-width": z([7, 0.7, 11, 1.1, 15, 2]),
        "line-opacity": z([
          7,
          ["case", TUNNEL, 0.3, 0.6],
          10,
          ["case", TUNNEL, 0.35, 0.9],
        ]),
      },
    },
    {
      id: "rail-ties",
      type: "line",
      source: SRC,
      "source-layer": "transportation",
      minzoom: 11,
      filter: ["all", isClass("rail"), ["!", TUNNEL]],
      paint: {
        "line-color": KMAP.rail,
        "line-width": z([11, 3.5, 15, 7]),
        "line-dasharray": [0.18, 2.2],
        "line-opacity": 0.85,
      },
    },
    {
      id: "ferry",
      type: "line",
      source: SRC,
      "source-layer": "transportation",
      filter: isClass("ferry"),
      paint: {
        "line-color": KMAP.ferry,
        "line-width": z([8, 0.8, 13, 1.4]),
        "line-dasharray": [3, 2.5],
        "line-opacity": 0.7,
      },
    },
  ];
}

function labelLayers(locale: string): LayerSpecification[] {
  const placeSize = (
    city: number,
    town: number,
    state: number,
    other: number,
  ) =>
    [
      "match",
      cls,
      "city",
      ["case", ["<", ["coalesce", ["get", "rank"], 99], 8], city, city - 1.5],
      "town",
      town,
      ["state", "province"],
      state,
      "country",
      state + 1,
      other,
    ] as ExpressionSpecification;

  return [
    {
      id: "road-label",
      type: "symbol",
      source: SRC,
      "source-layer": "transportation_name",
      minzoom: 12.5,
      filter: ["has", "name"],
      layout: {
        "symbol-placement": "line",
        "text-field": name(locale),
        "text-font": FONT.regular,
        "text-size": z([12.5, 10, 15, 12]),
        "text-max-angle": 30,
        "text-padding": 8,
      },
      paint: {
        "text-color": KMAP.roadLabel,
        "text-halo-color": "rgba(255,255,255,0.9)",
        "text-halo-width": 1.3,
      },
    },
    {
      id: "river-label",
      type: "symbol",
      source: SRC,
      "source-layer": "waterway",
      minzoom: 8,
      filter: ["has", "name"],
      layout: {
        "symbol-placement": "line",
        "text-field": name(locale),
        "text-font": FONT.italic,
        "text-size": z([8, 10, 13, 12]),
        "text-letter-spacing": 0.05,
        "symbol-spacing": 320,
        "text-max-angle": 25,
      },
      paint: {
        "text-color": KMAP.riverLabel,
        "text-halo-color": "rgba(252,251,246,0.8)",
        "text-halo-width": 1.2,
      },
    },
    {
      id: "peak-dot",
      type: "circle",
      source: SRC,
      "source-layer": "mountain_peak",
      minzoom: 7,
      filter: ["has", "name"],
      paint: {
        "circle-radius": 2.2,
        "circle-color": KMAP.peak,
        "circle-stroke-color": KMAP.halo,
        "circle-stroke-width": 1.4,
      },
    },
    {
      id: "peak-label",
      type: "symbol",
      source: SRC,
      "source-layer": "mountain_peak",
      minzoom: 7,
      filter: ["has", "name"],
      layout: {
        "text-field": [
          "case",
          ["has", "ele"],
          [
            "concat",
            name(locale),
            " · ",
            ["number-format", ["get", "ele"], { locale }],
            " m",
          ],
          name(locale),
        ],
        "text-font": FONT.regular,
        "text-size": z([7, 10, 12, 11.5]),
        "text-variable-anchor": ["top", "bottom", "left", "right"],
        "text-radial-offset": 0.55,
        "text-max-width": 30,
        "text-padding": 6,
        "symbol-sort-key": ["-", 0, ["coalesce", ["get", "ele"], 0]],
      },
      paint: {
        "text-color": KMAP.peak,
        "text-halo-color": KMAP.halo,
        "text-halo-width": 1.4,
      },
    },
    {
      id: "place",
      type: "symbol",
      source: SRC,
      "source-layer": "place",
      filter: isClass(
        "country",
        "state",
        "province",
        "city",
        "town",
        "village",
        "island",
      ),
      layout: {
        "text-field": name(locale),
        "text-font": [
          "match",
          cls,
          ["city", "town", "country"],
          ["literal", FONT.bold],
          ["literal", FONT.regular],
        ],
        "text-transform": [
          "match",
          cls,
          ["state", "province", "country"],
          "uppercase",
          "none",
        ],
        "text-letter-spacing": [
          "match",
          cls,
          ["state", "province", "country"],
          0.22,
          0.01,
        ],
        "text-size": z([
          4,
          placeSize(11, 11, 9.5, 10),
          5,
          placeSize(12.5, 11, 10, 10),
          7,
          placeSize(13.5, 11.5, 11, 10),
          9,
          placeSize(15, 12, 11, 10.5),
          13,
          placeSize(16, 13.5, 11, 12),
        ]),
        "text-max-width": 7,
        "text-padding": 3,
        "symbol-sort-key": ["coalesce", ["get", "rank"], 99],
      },
      paint: {
        "text-color": [
          "match",
          cls,
          ["city", "town"],
          KMAP.city,
          ["state", "province", "country"],
          KMAP.state,
          KMAP.village,
        ],
        ...HALO,
        "text-halo-width": [
          "match",
          cls,
          ["state", "province", "country"],
          1,
          1.6,
        ],
      },
    },
  ];
}

export function kuriousStyle(locale = "es"): StyleSpecification {
  const sources: Record<string, SourceSpecification> = {
    [SRC]: { type: "vector", url: TILES_URL },
    terrain: {
      type: "raster-dem",
      tiles: [TERRARIUM_URL],
      encoding: "terrarium",
      tileSize: 256,
      maxzoom: 15,
    },
  };
  return {
    version: 8,
    name: "Kurious v4",
    glyphs: GLYPHS_URL,
    sources,
    layers: [
      ...landLayers(),
      ...waterLayers(locale),
      ...lineLayers(),
      ...labelLayers(locale),
    ],
  };
}

export const OVERLAY = {
  route: "kurious-route",
  shapes: "kurious-shapes",
} as const;

export function overlaySources(): Record<string, SourceSpecification> {
  return {
    [OVERLAY.route]: {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    },
    [OVERLAY.shapes]: {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    },
  };
}

const HOT = ["==", ["get", "hot"], true] as ExpressionSpecification;
const PICKED = ["==", ["get", "selected"], true] as ExpressionSpecification;

export function overlayLayers(): LayerSpecification[] {
  return [
    {
      id: "kurious-shape-fill",
      type: "fill",
      source: OVERLAY.shapes,
      filter: ["==", ["geometry-type"], "Polygon"],
      paint: {
        "fill-color": ["case", HOT, KMAP.hot, KMAP.shape],
        "fill-opacity": ["case", PICKED, 0.22, 0.12],
      },
    },
    {
      id: "kurious-shape-case",
      type: "line",
      source: OVERLAY.shapes,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": "#FFFFFF",
        "line-width": z([5, 5, 9, 8, 13, 10]),
      },
    },
    {
      id: "kurious-shape-line",
      type: "line",
      source: OVERLAY.shapes,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": ["case", HOT, KMAP.hot, KMAP.shape],
        "line-width": z([5, 3, 9, 4.5, 13, 5.5]),
        "line-opacity": ["case", PICKED, 1, 0.8],
      },
    },
    {
      id: "kurious-route-case",
      type: "line",
      source: OVERLAY.route,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#FFFFFF", "line-width": 6, "line-opacity": 0.95 },
    },
    {
      id: "kurious-route",
      type: "line",
      source: OVERLAY.route,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": KMAP.route,
        "line-width": 3,
        "line-dasharray": [1.6, 1.5],
      },
    },
  ];
}

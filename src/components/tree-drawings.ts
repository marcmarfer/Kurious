import type { Growth } from "@/features/trips/types";

export type DrawingSize = "big" | "small";

type Palette = {
  leafShade: string;
  leafDark: string;
  leafLight: string;
  leafHi: string;
  trunkL: string;
  trunkR: string;
  branch: string;
  stem: string;
};

type Light = "left" | "none";
type Point = [number, number];
type Curve = [Point, Point, Point, Point];

const C = {
  moss: "#2E6A4E",
  forest: "#7DBE55",
  grass: "#C9E29B",
  barkLight: "#8E5434",
  barkDark: "#5A321E",
  branch: "#6B3D24",
  soilDark: "#8E4A2A",
  soilLight: "#B9693F",
  seedDark: "#6E3218",
  seedLight: "#B0602F",
  seedShine: "#E7A577",
  fireDark: "#C2410C",
  fireLight: "#F59A45",
  shadow: "#1F2A24",
  cream: "#FCFBF6",
  forestDark: "#1D4736",
  paper: "#F4F0DC",
};

const GREEN: Palette = {
  leafShade: C.forestDark,
  leafDark: C.moss,
  leafLight: C.forest,
  leafHi: C.grass,
  trunkL: C.barkLight,
  trunkR: C.barkDark,
  branch: C.branch,
  stem: "#4E8A3A",
};

const FIRE: Palette = {
  ...GREEN,
  leafShade: "#9A3412",
  leafDark: C.fireDark,
  leafLight: C.fireLight,
  leafHi: "#FBD3A3",
};

const r = (n: number) => +n.toFixed(2);
const rad = (d: number) => (d * Math.PI) / 180;

function softNeedle(
  bx: number,
  by: number,
  ang: number,
  len: number,
  w: number,
) {
  const a = rad(ang);
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const nx = -uy;
  const ny = ux;
  const tr = w * 0.24;
  const hx = bx + ux * (len - tr);
  const hy = by + uy * (len - tr);
  const p = (x: number, y: number) => `${r(x)} ${r(y)}`;
  return `M${p(bx + (nx * w) / 2, by + (ny * w) / 2)}L${p(hx + nx * tr, hy + ny * tr)}A${r(tr)} ${r(tr)} 0 0 0 ${p(hx - nx * tr, hy - ny * tr)}L${p(bx - (nx * w) / 2, by - (ny * w) / 2)}Z`;
}

type PomLayer = "back" | "shade" | "base" | "lit" | "hi";

function pom(
  cx: number,
  cy: number,
  pal: Palette,
  { R = 4, n = 14, w = 1.2, light = "left" as Light } = {},
) {
  const flat = light === "none";
  const layers: Record<PomLayer, string[]> = {
    back: [],
    shade: [],
    base: [],
    lit: [],
    hi: [],
  };
  const ring = (
    rr: number,
    ww: number,
    off: number,
    pick: (d: number, alt: boolean) => PomLayer | null,
    ox = 0,
    oy = 0,
  ) => {
    for (let i = 0; i < n; i++) {
      const ang = -90 + (360 * (i + off)) / n;
      const L = rr * (i % 3 === 0 ? 0.97 : i % 3 === 1 ? 0.91 : 0.86);
      const a = ((ang % 360) + 360) % 360;
      const up = a > 180 && a < 360;
      const ex = Math.cos(rad(ang)) * L;
      const ey = Math.sin(rad(ang)) * L * (up ? 1.12 : 0.9);
      const len = Math.hypot(ex, ey);
      const aa = (Math.atan2(ey, ex) * 180) / Math.PI;
      const d = Math.abs(((((a - 225) % 360) + 540) % 360) - 180);
      const k = flat ? "base" : pick(d, i % 2 === 0);
      if (k) layers[k].push(softNeedle(cx + ox, cy + oy, aa, len, ww));
    }
  };
  const band = (d: number, edge: number, alt: boolean) =>
    d < edge - 9 || (d < edge + 9 && alt);
  if (!flat)
    ring(R, w, 0.5, (d) => (d > 70 ? "back" : null), R * 0.12, R * 0.13);
  ring(R, w, 0, (d, alt) =>
    band(d, 40, alt) ? "lit" : d > 126 || (d > 108 && !alt) ? "shade" : "base",
  );
  ring(R * 0.78, w * 0.92, 0.5, (d, alt) =>
    band(d, 62, alt) ? "lit" : d > 134 || (d > 118 && alt) ? "shade" : "base",
  );
  ring(R * 0.64, w * 0.72, 0.25, (d, alt) =>
    band(d, 30, alt) ? "hi" : d < 100 ? "lit" : "base",
  );
  const j = `stroke-width="${r(w * 0.3)}" stroke-linejoin="round"`;
  const layer = (list: string[], col: string) =>
    list.length
      ? `<path d="${list.join("")}" fill="${col}" stroke="${col}" ${j}/>`
      : "";
  const core = `<ellipse cx="${r(cx)}" cy="${r(cy)}" rx="${r(R * 0.3)}" ry="${r(R * 0.3 * 0.92)}" fill="${pal.leafDark}"/>`;
  return (
    layer(layers.back, pal.leafShade) +
    layer(layers.shade, pal.leafShade) +
    layer(layers.base, pal.leafDark) +
    layer(layers.lit, pal.leafLight) +
    layer(layers.hi, pal.leafHi) +
    core
  );
}

const pathOf = (P: Curve) =>
  `M${r(P[0][0])} ${r(P[0][1])}C${r(P[1][0])} ${r(P[1][1])} ${r(P[2][0])} ${r(P[2][1])} ${r(P[3][0])} ${r(P[3][1])}`;

function point(P: Curve, t: number): Point {
  const mt = 1 - t;
  const at = (k: 0 | 1) =>
    mt * mt * mt * P[0][k] +
    3 * mt * mt * t * P[1][k] +
    3 * mt * t * t * P[2][k] +
    t * t * t * P[3][k];
  return [at(0), at(1)];
}

function trunk(
  x: number,
  yBase: number,
  yTop: number,
  wBase: number,
  wTop: number,
  pal: Palette,
) {
  const L = `M${r(x - wBase / 2)} ${yBase}L${r(x - wTop / 2)} ${yTop}L${r(x + wTop / 2)} ${yTop}L${r(x + wBase / 2)} ${yBase}Z`;
  const R = `M${x} ${yBase}L${x} ${yTop}L${r(x + wTop / 2)} ${yTop}L${r(x + wBase / 2)} ${yBase}Z`;
  return `<path d="${L}" fill="${pal.trunkL}"/><path d="${R}" fill="${pal.trunkR}"/>`;
}

const shadowEl = (rx: number) =>
  `<ellipse cx="24" cy="60.4" rx="${rx}" ry="1.7" fill="${C.shadow}" opacity=".16"/>`;

function mound(w: number, h: number, id: string) {
  const d = `M${24 - w / 2} 60.2C${r(24 - w * 0.32)} ${r(60.2 - h)} ${r(24 + w * 0.32)} ${r(60.2 - h)} ${24 + w / 2} 60.2Z`;
  return `<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${C.soilDark}"/><ellipse clip-path="url(#${id})" cx="${r(24 - w * 0.12)}" cy="${r(60.2 - h * 0.9)}" rx="${r(w * 0.42)}" ry="${r(h * 0.75)}" fill="${C.soilLight}"/>`;
}

function flameBadge(cx: number, cy: number, radius: number) {
  const s = radius / 5.6;
  const f = (x: number, y: number) => `${r(cx + x * s)} ${r(cy + y * s)}`;
  return `<circle cx="${cx}" cy="${cy}" r="${r(radius + 1.3 * s)}" fill="${C.cream}"/><circle cx="${cx}" cy="${cy}" r="${radius}" fill="${C.fireDark}"/><path d="M${f(0, -3.7)}C${f(0.6, -1.7)} ${f(2.8, -0.9)} ${f(2.8, 1.1)}A${r(2.8 * s)} ${r(2.8 * s)} 0 0 1 ${f(-2.8, 1.1)}C${f(-2.8, -0.3)} ${f(-2.1, -1)} ${f(-1.3, -1.6)}C${f(-1.1, -0.6)} ${f(-0.6, -0.1)} ${f(0, 0)}C${f(0.25, -1.3)} ${f(-0.1, -2.5)} ${f(0, -3.7)}Z" fill="${C.cream}"/>`;
}

const GLOW = `<defs><radialGradient id="glow"><stop offset="0" stop-color="#F59E0B" stop-opacity=".5"/><stop offset=".6" stop-color="#F59E0B" stop-opacity=".16"/><stop offset="1" stop-color="#F59E0B" stop-opacity="0"/></radialGradient></defs><ellipse cx="24" cy="14" rx="28" ry="18" fill="url(#glow)"/>`;

type Arm = [number, number, number, number];

function dome({
  cx = 24,
  cy,
  rx,
  ry,
  thetas,
  y0s,
}: {
  cx?: number;
  cy: number;
  rx: number;
  ry: number;
  thetas: number[];
  y0s: number[];
}) {
  const arms: Arm[] = [];
  thetas.forEach((th, i) => {
    const t = rad(th);
    const lift = thetas.length === 1 ? 1 : i / (thetas.length - 1);
    for (const sg of [-1, 1])
      arms.push([
        y0s[i],
        cx + sg * rx * Math.cos(t),
        cy - ry * Math.sin(t),
        lift,
      ]);
  });
  return arms;
}

type PomOptions = { R: number; n: number; w: number };

type Adult = {
  top: number;
  tw: [number, number];
  sw: number;
  apex: [number, number, number];
  pom: PomOptions;
  mid: (PomOptions & { t: number; min: number }) | null;
  arms: Arm[];
};

const ADULT: Record<"big" | "small" | "tiny", Adult> = {
  big: {
    top: 10.5,
    tw: [4, 1.8],
    sw: 1.05,
    apex: [24, 8.6, 5.4],
    pom: { R: 5.2, n: 18, w: 1.15 },
    mid: { t: 0.5, R: 3.4, n: 14, w: 0.95, min: 15 },
    arms: dome({
      cy: 22,
      rx: 19.5,
      ry: 13,
      thetas: [4, 30, 62],
      y0s: [30.5, 24.5, 19],
    }),
  },
  small: {
    top: 11,
    tw: [5.2, 2.4],
    sw: 1.8,
    apex: [24, 9.4, 6.6],
    pom: { R: 6.6, n: 14, w: 1.9 },
    mid: null,
    arms: dome({ cy: 22, rx: 19, ry: 12, thetas: [10, 58], y0s: [29.5, 22] }),
  },
  tiny: {
    top: 14,
    tw: [7, 3.4],
    sw: 3,
    apex: [24, 11.8, 8.6],
    pom: { R: 8.6, n: 14, w: 2.8 },
    mid: null,
    arms: dome({ cy: 22, rx: 15.5, ry: 9, thetas: [35], y0s: [24.5] }),
  },
};

function araucaria(
  size: keyof typeof ADULT,
  { onFire = false, ground = true } = {},
) {
  const pal = onFire ? FIRE : GREEN;
  const scale = ground ? 0.92 : 1;
  const G = ADULT[size];
  const out: string[] = [];
  if (onFire) out.push(GLOW);
  if (ground) out.push(shadowEl(size === "big" ? 6.5 : 7.5));
  out.push(trunk(24, 60.4, G.top, G.tw[0], G.tw[1], pal));
  const poms: Point[] = [];
  const mids: Point[] = [];
  for (const [y0, tx, ty, lift] of G.arms) {
    const P: Curve = [
      [24, y0],
      [24 + (tx - 24) * 0.55, y0 - (y0 - ty) * 0.08],
      [
        tx - (tx - 24) * (0.34 - 0.3 * lift),
        ty + (y0 - ty) * (0.28 + 0.22 * lift),
      ],
      [tx, ty],
    ];
    out.push(
      `<path d="${pathOf(P)}" fill="none" stroke="${pal.branch}" stroke-width="${G.sw}" stroke-linecap="round"/>`,
    );
    if (G.mid && Math.abs(tx - 24) > G.mid.min) mids.push(point(P, G.mid.t));
    poms.push([tx, ty]);
  }
  for (const [x, y] of mids) out.push(pom(x, y, pal, G.mid!));
  for (const [x, y] of poms) out.push(pom(x, y, pal, G.pom));
  out.push(pom(G.apex[0], G.apex[1], pal, { ...G.pom, R: G.apex[2] }));
  const at = (v: number, o: number) => r(o + (v - o) * scale);
  const tree =
    scale === 1
      ? out.join("")
      : `<g transform="translate(24 60.4) scale(${scale}) translate(-24 -60.4)">${out.join("")}</g>`;
  return (
    tree +
    (onFire
      ? flameBadge(
          at(size === "big" ? 40 : 39, 24),
          at(size === "big" ? 27 : 28, 60.4),
          size === "big" ? 5.6 : 7.4,
        )
      : "")
  );
}

function taperedArm(P: Curve, w0: number, w1: number, color: string) {
  const N = 28;
  const L: string[] = [];
  const Rt: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const [x, y] = point(P, t);
    const [xa, ya] = point(P, Math.max(0, t - 0.01));
    const [xb, yb] = point(P, Math.min(1, t + 0.01));
    const dx = xb - xa;
    const dy = yb - ya;
    const len = Math.hypot(dx, dy) || 1;
    const hw = (w0 + (w1 - w0) * t) / 2;
    const nx = (-dy / len) * hw;
    const ny = (dx / len) * hw;
    L.push(`${r(x + nx)} ${r(y + ny)}`);
    Rt.unshift(`${r(x - nx)} ${r(y - ny)}`);
  }
  const [ex, ey] = point(P, 1);
  return `<path d="M${L.join("L")}L${Rt.join("L")}Z" fill="${color}"/><circle cx="${r(ex)}" cy="${r(ey)}" r="${r(w1 / 2)}" fill="${color}"/>`;
}

function tiers(
  pal: Palette,
  list: [number, number][],
  {
    sw,
    tip,
    stemTop,
    apexLen,
  }: {
    sw: number;
    tip: PomOptions;
    stemTop: number;
    apexLen: number;
  },
) {
  let out = "";
  const poms: Point[] = [];
  for (const [y, h] of list)
    for (const s of [-1, 1]) {
      const x1 = 24 + s * h;
      const y1 = y - h * 0.42;
      const dx = x1 - 24;
      const rise = y - y1;
      const P: Curve = [
        [24, y],
        [24 + dx * 0.55, y - rise * 0.06],
        [x1 - dx * 0.16, y1 + rise * 0.42],
        [x1, y1],
      ];
      out += taperedArm(P, sw * 1.45, sw * 0.8, pal.branch);
      poms.push([x1, y1]);
    }
  for (const [x, y] of poms) out += pom(x, y, pal, tip);
  out += `<path d="M24 ${stemTop + 1}V${stemTop - 0.5}" stroke="${pal.branch}" stroke-width="${sw}" stroke-linecap="round"/>`;
  return out + pom(24, stemTop - 0.5, pal, { ...tip, R: apexLen });
}

function sapling(size: DrawingSize) {
  if (size === "big")
    return (
      shadowEl(9) +
      trunk(24, 60.4, 18, 2.8, 1.2, GREEN) +
      tiers(
        GREEN,
        [
          [48, 11.5],
          [38.5, 8.5],
          [29.5, 5.5],
        ],
        { sw: 0.9, tip: { R: 3.4, n: 14, w: 1 }, stemTop: 18, apexLen: 3.8 },
      )
    );
  return (
    shadowEl(10) +
    trunk(24, 60.4, 19, 3.8, 1.6, GREEN) +
    tiers(
      GREEN,
      [
        [47, 12],
        [35, 7.5],
      ],
      { sw: 1.7, tip: { R: 5, n: 16, w: 1.6 }, stemTop: 19, apexLen: 5 },
    )
  );
}

function sprout(size: DrawingSize) {
  if (size === "big")
    return (
      shadowEl(11) +
      trunk(24, 58.6, 38, 2, 1, GREEN) +
      tiers(GREEN, [[50, 6.5]], {
        sw: 0.85,
        tip: { R: 3.2, n: 14, w: 0.95 },
        stemTop: 38,
        apexLen: 3.6,
      }) +
      mound(20, 4.4, "m")
    );
  return (
    shadowEl(11) +
    trunk(24, 58.4, 37, 3, 1.4, GREEN) +
    tiers(GREEN, [[49, 8]], {
      sw: 1.6,
      tip: { R: 4.8, n: 16, w: 1.6 },
      stemTop: 37,
      apexLen: 4.8,
    }) +
    mound(26, 5.6, "m")
  );
}

function seed(size: DrawingSize) {
  const k = size === "big" ? 1.15 : 1.5;
  const tipY = 60 - 17 * k;
  const sd = `M24 ${r(tipY)}C${r(24 + 5.6 * k)} ${r(60 - 12.5 * k)} ${r(24 + 5.8 * k)} ${r(60 - 3 * k)} 24 ${r(60 - 1.2 * k)}C${r(24 - 5.8 * k)} ${r(60 - 3 * k)} ${r(24 - 5.6 * k)} ${r(60 - 12.5 * k)} 24 ${r(tipY)}Z`;
  const shine =
    size === "big"
      ? `<path d="M${r(24 - 2.6 * k)} ${r(60 - 12 * k)}Q${r(24 - 3 * k)} ${r(60 - 7 * k)} ${r(24 - 1.6 * k)} ${r(60 - 4.6 * k)}" fill="none" stroke="${C.seedShine}" stroke-width="1.1" stroke-linecap="round"/>`
      : "";
  const dy = tipY - 52;
  const sx = r(24 + dy * Math.sin(rad(14)));
  const sy = r(52 + dy * Math.cos(rad(14)));
  const up = size === "big" ? 3.6 : 4.6;
  const shoot =
    `<path d="M${sx} ${r(sy + 0.8)}V${r(sy - up)}" stroke="${GREEN.stem}" stroke-width="${size === "big" ? 1.4 : 2}" stroke-linecap="round"/>` +
    pom(
      sx,
      sy - up - 2,
      GREEN,
      size === "big" ? { R: 3.4, n: 14, w: 1 } : { R: 4.8, n: 16, w: 1.6 },
    );
  return (
    shadowEl(12) +
    `<g transform="rotate(-14 24 52)"><clipPath id="s"><path d="${sd}"/></clipPath><path d="${sd}" fill="${C.seedDark}"/><ellipse clip-path="url(#s)" cx="${r(24 - 2.4 * k)}" cy="${r(60 - 11 * k)}" rx="${r(4.6 * k)}" ry="${r(9 * k)}" fill="${C.seedLight}"/>${shine}</g>` +
    shoot +
    mound(size === "big" ? 30 : 34, size === "big" ? 5.6 : 7, "m")
  );
}

const DRAW: Record<Growth, (size: DrawingSize) => string> = {
  seed,
  sprout,
  sapling,
  araucaria: (size) => araucaria(size),
  fire: (size) => araucaria(size, { onFire: true }),
};

const cache = new Map<string, string>();

function cached(key: string, draw: () => string) {
  let markup = cache.get(key);
  if (markup === undefined) {
    markup = draw();
    cache.set(key, markup);
  }
  return markup;
}

export function scopeIds(markup: string, prefix: string) {
  return markup
    .replace(/ id="([^"]+)"/g, ` id="${prefix}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`);
}

export function growthDrawing(growth: Growth, size: DrawingSize) {
  return cached(`${growth}:${size}`, () => DRAW[growth](size));
}

export type AppIconSize = 96 | 46 | 16;

export function appIconSize(px: number): AppIconSize {
  return px >= 24 ? 96 : 16;
}

export function appIconDrawing(size: AppIconSize) {
  return cached(`app:${size}`, () => {
    const tree = araucaria(
      size === 96 ? "big" : size === 46 ? "small" : "tiny",
      { ground: false },
    );
    return `<clipPath id="a"><rect width="48" height="48" rx="10.8"/></clipPath><rect width="48" height="48" rx="10.8" fill="${C.paper}"/><g clip-path="url(#a)"><g transform="translate(3.8 1.2) scale(.84)">${tree}</g></g>`;
  });
}

type Hill = { x: number; y: number; r: number; rings: number; seed: number };

const HILLS: Hill[] = [
  { x: 60, y: 120, r: 26, rings: 7, seed: 1 },
  { x: 350, y: 330, r: 20, rings: 8, seed: 2 },
  { x: 90, y: 640, r: 24, rings: 7, seed: 3 },
  { x: 360, y: 790, r: 18, rings: 5, seed: 4 },
];

const PATCHES = [
  { x: 330, y: 90, rx: 120, ry: 70 },
  { x: 40, y: 400, rx: 110, ry: 90 },
  { x: 380, y: 590, rx: 100, ry: 80 },
  { x: 160, y: 860, rx: 150, ry: 70 },
];

function ring(x: number, y: number, r: number, seed: number) {
  const n = 36;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k =
      1 +
      0.16 * Math.sin(3 * a + seed) +
      0.09 * Math.sin(5 * a + seed * 2.3) +
      0.05 * Math.cos(7 * a + seed * 0.7);
    return [x + Math.cos(a) * r * k * 1.25, y + Math.sin(a) * r * k] as const;
  });
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [-1, 0, 1, 2].map((o) => pts[(i + o + n) % n]);
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d}Z`;
}

const CONTOURS = HILLS.flatMap((h) =>
  Array.from({ length: h.rings }, (_, i) =>
    ring(h.x, h.y, h.r * (1 + i * 0.75), h.seed + i * 0.35),
  ),
);

export function MapPaper({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 900"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="paper-patch">
          <stop offset="0" stopColor="#c9e29b" stopOpacity=".7" />
          <stop offset=".6" stopColor="#c9e29b" stopOpacity=".35" />
          <stop offset="1" stopColor="#c9e29b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="900" fill="#f4f0dc" />
      {PATCHES.map((p) => (
        <ellipse
          key={`${p.x}-${p.y}`}
          cx={p.x}
          cy={p.y}
          rx={p.rx}
          ry={p.ry}
          fill="url(#paper-patch)"
        />
      ))}
      <g
        fill="none"
        stroke="#cfc6a3"
        strokeWidth="1"
        opacity=".55"
        vectorEffect="non-scaling-stroke"
      >
        {CONTOURS.map((d) => (
          <path key={d} d={d} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
}

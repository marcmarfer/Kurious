import { useId } from "react";

const round = (n: number) => +n.toFixed(2);

function Tuft({
  cx,
  cy,
  rx,
  ry,
  fill,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fill: string;
}) {
  const p = (x: number, y: number) =>
    `${round(cx + rx * x)} ${round(cy + ry * y)}`;
  return (
    <>
      <path
        d={`M${p(-1, 0.15)}Q${p(-1.02, -0.95)} ${p(-0.42, -0.9)}Q${p(-0.18, -1.55)} ${p(0.18, -1.4)}Q${p(0.5, -1.3)} ${p(0.62, -0.82)}Q${p(1.04, -0.7)} ${p(1, 0.15)}Q${p(0.3, 1.25)} ${p(-1, 0.15)}Z`}
        fill={fill}
      />
      <path
        d={`M${p(-0.62, -0.55)}Q${p(-0.1, -1.2)} ${p(0.4, -0.75)}`}
        fill="none"
        stroke="#8CD85E"
        strokeWidth=".9"
        strokeLinecap="round"
        opacity=".9"
      />
    </>
  );
}

const CROWN: [number, number, number, number][] = [
  [6.6, 15.2, 5.2, 2.9],
  [10.8, 9.4, 5.4, 3],
  [17.4, 7.2, 5.4, 3],
  [24, 5.6, 5.6, 3.1],
  [30.6, 7.2, 5.4, 3],
  [37.2, 9.4, 5.4, 3],
  [41.4, 15.2, 5.2, 2.9],
  [10, 33.2, 4.2, 2.3],
  [38, 33.2, 4.2, 2.3],
];

export function Araucaria({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const leaves = `url(#kt${id})`;

  return (
    <svg
      viewBox="0 0 48 64"
      className={className}
      aria-hidden="true"
      overflow="visible"
    >
      <defs>
        <radialGradient id={`kt${id}`} cx=".42" cy=".22" r=".9">
          <stop offset="0" stopColor="#8CD85E" />
          <stop offset=".5" stopColor="#2F8A43" />
          <stop offset="1" stopColor="#154A2A" />
        </radialGradient>
        <linearGradient id={`kb${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#A36C49" />
          <stop offset=".55" stopColor="#7A4E33" />
          <stop offset="1" stopColor="#4A2E1D" />
        </linearGradient>
      </defs>
      <ellipse cx="24" cy="62" rx="10" ry="2.1" fill="#1F2A24" opacity=".24" />
      <path d="M22.4 62.2L23.3 14H24.7L25.6 62.2Z" fill={`url(#kb${id})`} />
      <path
        d="M24 16.2C19 16.4 13.8 15.6 10.6 10.2M24 16.2C29 16.4 34.2 15.6 37.4 10.2M24 15.2C21.2 14.6 18.8 12.4 17.4 8.2M24 15.2C26.8 14.6 29.2 12.4 30.6 8.2M24 15V6.6M24 21.8C18 22.4 11.2 21.8 6.6 16.2M24 21.8C30 22.4 36.8 21.8 41.4 16.2M24 28.6C19.4 29.4 14.2 30.8 10.2 32.8M24 28.6C28.6 29.4 33.8 30.8 37.8 32.8"
        fill="none"
        stroke="#5A3A26"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      {CROWN.map(([cx, cy, rx, ry]) => (
        <Tuft
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={leaves}
        />
      ))}
    </svg>
  );
}

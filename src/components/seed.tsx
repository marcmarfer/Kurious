import { useId } from "react";

export function Seed({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 48 64"
      className={className}
      aria-hidden="true"
      overflow="visible"
    >
      <defs>
        <linearGradient id={`kn${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E08A4E" />
          <stop offset=".5" stopColor="#A7482A" />
          <stop offset="1" stopColor="#5E2513" />
        </linearGradient>
      </defs>
      <ellipse cx="24" cy="62" rx="15" ry="2.4" fill="#1F2A24" opacity=".22" />
      <path d="M7 62.2C12 55.4 36 55.4 41 62.2Z" fill="#B4532B" />
      <path
        d="M10.6 61C16 57.6 32 57.6 37.4 61"
        fill="none"
        stroke="#DD7C4C"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity=".75"
      />
      <path
        d="M16.8 60.4C15 52.6 18.4 46.4 24.2 46C29.6 45.6 32.8 51.4 31 59.6Z"
        fill={`url(#kn${id})`}
      />
      <path
        d="M20 56.8C19.4 53.2 20.6 50.2 23 49.2"
        fill="none"
        stroke="#F6B98C"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity=".85"
      />
      <path
        d="M24.4 46.6C24.2 40.6 24.8 35.4 26 30.8"
        fill="none"
        stroke="#5E8A3A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M24.9 41.4L19.8 38.2M24.9 41.4L29.8 38.8M25.3 37.4L21 33.8M25.3 37.4L29.6 34.4M25.7 34L22.6 30M25.7 34L29.2 30.6M26 31.4V26.4"
        fill="none"
        stroke="#3FA84E"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

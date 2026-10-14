import { useTranslations } from "next-intl";
import type { TravelerTag } from "./traveler-tags";

type Tone = "forest" | "lagoon" | "plum" | "pinhao" | "ochre";

const TONES: Record<Tone, { soft: string; solid: string; ink: string }> = {
  forest: {
    soft: "bg-forest-soft text-forest-dark",
    solid: "bg-forest-dark border-forest-dark text-cream",
    ink: "text-forest-dark",
  },
  lagoon: {
    soft: "bg-lagoon-soft text-lagoon",
    solid: "bg-lagoon border-lagoon text-cream",
    ink: "text-lagoon",
  },
  plum: {
    soft: "bg-plum-soft text-plum",
    solid: "bg-plum border-plum text-cream",
    ink: "text-plum",
  },
  pinhao: {
    soft: "bg-pinhao-soft text-pinhao",
    solid: "bg-pinhao border-pinhao text-cream",
    ink: "text-pinhao",
  },
  ochre: {
    soft: "bg-ochre-soft text-kind-food-ink",
    solid: "bg-kind-food-ink border-kind-food-ink text-cream",
    ink: "text-kind-food-ink",
  },
};

const TAGS: Record<TravelerTag, { tone: Tone; d: string }> = {
  adventure: {
    tone: "forest",
    d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z",
  },
  nature: { tone: "forest", d: "M5 19c0-8 6-14 15-14 0 9-6 15-14 15M5 19l7-7" },
  mountains: { tone: "forest", d: "M3 20l6-11 4 7 3-4 5 8z" },
  beach: {
    tone: "lagoon",
    d: "M2 18c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  },
  relax: { tone: "lagoon", d: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" },
  culture: {
    tone: "plum",
    d: "M3 21h18M4 10h16M12 3l8 5H4zM6 10v8M10 10v8M14 10v8M18 10v8",
  },
  city: {
    tone: "plum",
    d: "M4 21V8l6-3v16M10 21V3l8 4v14M3 21h18M14 9h1M14 13h1M14 17h1",
  },
  photography: {
    tone: "plum",
    d: "M4 8h3l2-3h6l2 3h3v11H4zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  },
  nightlife: {
    tone: "plum",
    d: "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  },
  food: {
    tone: "pinhao",
    d: "M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3M17 21V3c-2.5 1.5-3 5-3 8h3",
  },
  comfort: {
    tone: "pinhao",
    d: "M3 18V7M3 13h18v5M21 18v-3M7 13v-2a2 2 0 0 1 2-2h8a3 3 0 0 1 3 3v1",
  },
  early_riser: {
    tone: "pinhao",
    d: "M3 18h18M7 18a5 5 0 0 1 10 0M12 4v3M5 9l2 2M19 9l-2 2",
  },
  budget: {
    tone: "ochre",
    d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2s1.3 1.7 3 2 3 .9 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6.5v11",
  },
  planner: {
    tone: "ochre",
    d: "M10 6h10M10 12h10M10 18h10M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2",
  },
  spontaneous: { tone: "ochre", d: "M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" },
  road_trip: {
    tone: "ochre",
    d: "M3 16v-4l2-5h14l2 5v4zM3 16v2M21 16v2M7.5 12.5h.01M16.5 12.5h.01",
  },
};

export function TagIcon({
  tag,
  className = "size-3.5",
}: {
  tag: TravelerTag;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
    >
      <path d={TAGS[tag].d} />
    </svg>
  );
}

export function tagTone(tag: TravelerTag) {
  return TONES[TAGS[tag].tone];
}

export function TravelerTagChip({
  tag,
  size = "md",
}: {
  tag: TravelerTag;
  size?: "sm" | "md";
}) {
  const t = useTranslations("TravelerTags");
  const sizing =
    size === "sm"
      ? "gap-1 px-2 py-0.5 text-[11px]"
      : "gap-1.5 px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold ${sizing} ${tagTone(tag).soft}`}
    >
      <TagIcon tag={tag} className={size === "sm" ? "size-3" : "size-3.5"} />
      {t(tag)}
    </span>
  );
}

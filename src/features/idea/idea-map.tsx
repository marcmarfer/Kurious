"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useSyncExternalStore, type ReactNode, type Ref } from "react";
import { ChevronLeftIcon, PinIcon, RailIcon } from "@/components/icons";
import { kindInkClass } from "@/components/kind-label";
import { TripMap, type TripMapHandle } from "@/features/map/trip-map";
import type { LngLat } from "@/features/map/trip-markers";
import type { Idea, Trip } from "@/features/trips/types";
import { Link, useRouter } from "@/i18n/navigation";

const GLASS = "bg-cream/92 backdrop-blur-[12px]";

const WIDE_FROM = 1024;
const RAIL_AND_PANEL = 84 + 520;

function subscribeResize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

function useViewportWidth() {
  return useSyncExternalStore(
    subscribeResize,
    () => window.innerWidth,
    () => 0,
  );
}

function mapInsets(viewport: number, withChips: boolean) {
  if (viewport < WIDE_FROM)
    return { top: 60, bottom: withChips ? 74 : 26, left: 24, right: 24 };
  const side = Math.max(32, Math.round((viewport - RAIL_AND_PANEL) * 0.1));
  return { top: 62, bottom: withChips ? 62 : 14, left: side, right: side };
}

export function IdeaMap({
  trip,
  idea,
  hot,
  ideas,
  movable,
  onMove,
  notice,
  mapRef,
  draft,
  onDraft,
  onPlace,
  placing,
}: {
  trip: Trip;
  idea: Idea;
  hot: boolean;
  ideas: Idea[];
  movable: boolean;
  onMove: (id: string, point: LngLat) => void;
  notice: ReactNode;
  mapRef: Ref<TripMapHandle>;
  draft: LngLat | null;
  onDraft?: (point: LngLat) => void;
  onPlace?: () => void;
  placing: ReactNode;
}) {
  const t = useTranslations("Idea");
  const nav = useTranslations("Nav");
  const format = useFormatter();
  const router = useRouter();
  const viewport = useViewportWidth();

  const length =
    idea.lengthM && idea.lengthM > 0
      ? format.number(idea.lengthM / 1000, {
          style: "unit",
          unit: "kilometer",
          maximumFractionDigits: idea.lengthM < 10_000 ? 1 : 0,
        })
      : null;

  const placed =
    idea.shape !== null || (idea.lon !== null && idea.lat !== null);
  const chips = [
    length && {
      key: "length",
      text: t("length", { length }),
      icon: (
        <RailIcon
          className={`size-4 lg:size-[17px] ${hot ? "text-fire" : kindInkClass(idea.kind)}`}
        />
      ),
    },
    !placed && {
      key: "noPlace",
      text: t("noPlace"),
      icon: <PinIcon className="text-muted size-4 lg:size-[17px]" />,
    },
  ].filter((chip) => !!chip);

  function open(id: string) {
    if (onDraft) return;
    if (id !== idea.id && trip.ideas.some((other) => other.id === id))
      router.push(`/trips/${trip.id}/ideas/${id}`);
  }

  return (
    <div className="bg-parchment relative h-[400px] shrink-0 overflow-hidden lg:h-auto lg:min-h-0">
      <TripMap
        stages={trip.stages}
        ideas={ideas}
        movableIds={movable && placed ? [idea.id] : undefined}
        onMove={onMove}
        selectedId={idea.id}
        focusIdeaId={placed ? idea.id : null}
        ref={mapRef}
        onSelect={open}
        onMapClick={onDraft}
        draftPoint={draft}
        showRoute={false}
        insets={mapInsets(viewport, chips.length > 0 || !!placing)}
        className="absolute inset-0"
        attributionClassName="hidden"
        label={t("mapLabel", { title: idea.title })}
      />
      <Link
        href={`/trips/${trip.id}?idea=${idea.id}`}
        className={`focus-ring text-ink absolute top-[calc(env(safe-area-inset-top)+16px)] left-4 flex size-[42px] items-center justify-center rounded-full border border-white/60 shadow-[0_6px_18px_rgba(10,20,15,.25)] lg:top-6 lg:left-6 lg:w-auto lg:gap-1.5 lg:pr-4 lg:pl-2.5 lg:shadow-[0_6px_18px_rgba(10,20,15,.22)] ${GLASS}`}
      >
        <ChevronLeftIcon className="size-5" strokeWidth={2.2} />
        <span className="sr-only text-sm font-extrabold whitespace-nowrap lg:not-sr-only">
          {nav("backToMap")}
        </span>
      </Link>
      {notice}
      {placing}
      {!placing && !placed && onPlace && (
        <button
          type="button"
          onClick={onPlace}
          className={`focus-ring text-forest-dark absolute bottom-[42px] left-4 flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-white/60 px-3.5 text-[13px] font-extrabold shadow-[0_4px_14px_rgba(10,20,15,.22)] lg:bottom-6 lg:left-6 lg:h-10 lg:text-sm ${GLASS}`}
        >
          <PinIcon className="size-4" strokeWidth={2.4} />
          {t("place.add")}
        </button>
      )}
      {!placing && chips.length > 0 && !(onPlace && !placed) && (
        <ul className="pointer-events-none absolute inset-x-4 bottom-[42px] flex flex-wrap gap-1.5 lg:inset-x-auto lg:bottom-6 lg:left-6 lg:gap-2">
          {chips.map((chip) => (
            <li
              key={chip.key}
              className={`text-ink flex h-8 items-center gap-1.5 rounded-full px-[11px] text-[12.5px] font-extrabold whitespace-nowrap shadow-[0_4px_14px_rgba(10,20,15,.22)] lg:h-9 lg:gap-[7px] lg:px-[13px] lg:text-[13.5px] ${GLASS}`}
            >
              {chip.icon}
              {chip.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

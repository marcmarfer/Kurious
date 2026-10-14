"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useId, useState, type ReactNode } from "react";
import { GrowthIcon } from "@/components/growth-icon";
import { ChevronDownIcon } from "@/components/icons";
import type { Growth } from "@/features/trips/types";

export function TripProgress({ done, total }: { done: number; total: number }) {
  const t = useTranslations("Plan");
  const format = useFormatter();
  const ratio = total ? done / total : 0;
  const tree: Growth =
    ratio > 2 / 3 ? "araucaria" : ratio > 1 / 3 ? "sapling" : "sprout";

  return (
    <section
      aria-label={t("progressLabel")}
      className="bg-forest-dark text-cream relative flex items-center gap-4 overflow-hidden rounded-[22px] px-[18px] py-4 shadow-[0_10px_26px_rgba(29,71,54,.28)]"
    >
      <span
        aria-hidden="true"
        className="motion-safe:animate-breathe absolute -right-10 -bottom-15 size-45 rounded-full bg-[#C9E29B]/10"
      />
      <span className="bg-cream/10 flex h-[76px] w-16 shrink-0 items-end justify-center rounded-[18px] pb-1.5">
        <GrowthIcon growth={tree} className="h-[60px] w-[45px]" />
      </span>
      <div className="relative flex min-w-0 grow flex-col gap-1.5">
        <span className="font-display text-[19px] leading-[1.15] font-semibold">
          {t("toVoteLeft", { count: total - done })}
        </span>
        <span className="text-cream/80 text-[13px] font-bold">
          {t("progressDetail", {
            done,
            total,
            percent: format.number(ratio, { style: "percent" }),
          })}
        </span>
        <span className="bg-cream/15 h-2 overflow-hidden rounded-full">
          <span
            className="bg-grass block h-2 rounded-full transition-[width] duration-500"
            style={{ width: `${ratio * 100}%` }}
          />
        </span>
      </div>
    </section>
  );
}

export function PlanViews({
  byStage,
  byTrip,
}: {
  byStage: ReactNode;
  byTrip: ReactNode;
}) {
  const t = useTranslations("Plan");
  const [view, setView] = useState<"stages" | "trip">("stages");
  const tab = (key: "stages" | "trip", label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={view === key}
      onClick={() => setView(key)}
      className={`focus-ring h-8 cursor-pointer rounded-full px-3.5 text-[12.5px] font-extrabold transition-colors ${view === key ? "bg-forest-dark text-cream" : "text-ink hover:bg-forest-soft/60"}`}
    >
      {label}
    </button>
  );

  return (
    <>
      <div
        role="tablist"
        aria-label={t("viewLabel")}
        className="bg-cream border-line flex h-10 items-center gap-0.5 self-start rounded-full border p-[3px] shadow-[0_1px_2px_rgba(31,42,36,.06)] lg:hidden"
      >
        {tab("stages", t("byStage"))}
        {tab("trip", t("byTrip"))}
      </div>
      <div className={view === "stages" ? "contents" : "hidden lg:contents"}>
        {byStage}
      </div>
      <div className={view === "trip" ? "contents lg:hidden" : "hidden"}>
        {byTrip}
      </div>
    </>
  );
}

export function TripRanking({
  rows,
  shown,
}: {
  rows: ReactNode[];
  shown: number;
}) {
  const t = useTranslations("Plan");
  const [all, setAll] = useState(false);
  const title = useId();
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby={title} className="flex flex-col gap-2.5">
      <h2 id={title} className="font-display text-ink text-lg font-semibold">
        {t("rankingTitle")}
      </h2>
      <ol className="bg-cream border-line shadow-card flex flex-col rounded-[22px] border px-2 py-1">
        {all ? rows : rows.slice(0, shown)}
      </ol>
      {rows.length > shown && (
        <button
          type="button"
          onClick={() => setAll((value) => !value)}
          className="focus-ring bg-cream border-line text-forest-dark flex h-[42px] cursor-pointer items-center justify-center gap-1.5 rounded-[14px] border text-sm font-extrabold"
        >
          {all ? t("less") : t("rankingAll", { count: rows.length })}
          <ChevronDownIcon
            strokeWidth={2.4}
            className={`size-4 transition-transform ${all ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </section>
  );
}

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { GrowthIcon } from "@/components/growth-icon";
import { ChevronRightIcon, PinOffIcon, PlusIcon } from "@/components/icons";
import { kindInkClass } from "@/components/kind-label";
import { VoteButtons } from "@/components/vote-buttons";
import type { Idea, Stage } from "@/features/trips/types";
import { Link } from "@/i18n/navigation";

const DARK_BUTTON =
  "focus-ring bg-forest-dark text-cream hover:bg-moss flex h-11 shrink-0 items-center gap-0.5 rounded-[14px] pr-2.5 pl-4 text-sm font-extrabold whitespace-nowrap transition-colors";

const TITLE = "font-display text-ink leading-[1.2] font-semibold";

const META = "text-muted text-[13px] leading-[1.3] lg:text-[13.5px]";

function Summary({
  aside,
  children,
}: {
  aside: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[88px] items-start gap-3 lg:min-h-0 lg:gap-3.5">
      {aside}
      <div className="flex min-w-0 grow flex-col gap-1">{children}</div>
    </div>
  );
}

export function IdeaSummary({
  idea,
  tripId,
  label,
  meta,
  points,
}: {
  idea: Idea;
  tripId: string;
  label: string;
  meta: string;
  points: string;
}) {
  const t = useTranslations("MapScreen");
  const hot = idea.growth === "fire";

  return (
    <>
      <Summary
        aside={
          <div className="flex w-12 shrink-0 flex-col items-center gap-1 lg:w-[52px]">
            <GrowthIcon growth={idea.growth} className="h-[59px] w-11" />
            <span
              className={`text-[11px] leading-none font-extrabold whitespace-nowrap ${hot ? "text-fire" : "text-moss"}`}
            >
              {points}
            </span>
          </div>
        }
      >
        <span
          className={`text-[11.5px] leading-[1.2] font-bold lg:text-xs ${hot ? "text-fire" : kindInkClass(idea.kind)}`}
        >
          {label}
        </span>
        <h2 className={`${TITLE} line-clamp-3 text-[19px] lg:text-[21px]`}>
          {idea.title}
        </h2>
        <span className={META}>{meta}</span>
      </Summary>
      <div className="flex items-start gap-2">
        <VoteButtons
          key={idea.id}
          tripId={tripId}
          ideaId={idea.id}
          fire={idea.fire}
          up={idea.up}
          down={idea.down}
          myVote={idea.myVote}
          size="large"
        />
        <Link
          href={`/trips/${tripId}/ideas/${idea.id}`}
          className={`${DARK_BUTTON} ml-auto`}
        >
          {t("openIdea")}
          <ChevronRightIcon className="size-[18px]" />
        </Link>
      </div>
    </>
  );
}

export function StageSummary({
  stage,
  number,
  tripId,
  label,
  meta,
}: {
  stage: Stage;
  number: number;
  tripId: string;
  label: string;
  meta: string;
}) {
  const t = useTranslations("MapScreen");

  return (
    <>
      <Summary
        aside={
          <span className="bg-forest-dark text-cream flex size-12 shrink-0 items-center justify-center rounded-full text-xl font-extrabold shadow-[inset_0_0_0_3px_var(--color-cream),0_0_0_1.5px_var(--color-forest-dark)]">
            {number}
          </span>
        }
      >
        <span className="text-moss text-[11.5px] leading-[1.2] font-bold lg:text-xs">
          {label}
        </span>
        <h2 className={`${TITLE} line-clamp-2 text-[21px] lg:text-[22px]`}>
          {stage.name}
        </h2>
        <span className={META}>{meta}</span>
      </Summary>
      <div className="flex items-center gap-2">
        <span className="text-muted grow text-[12.5px] leading-[1.3] font-semibold lg:text-[13px]">
          {t("stageHint")}
        </span>
        <Link href={`/trips/${tripId}/plan`} className={DARK_BUTTON}>
          {t("openStage")}
          <ChevronRightIcon className="size-[18px]" />
        </Link>
      </div>
    </>
  );
}

export function PickHint({
  tripId,
  unplaced,
}: {
  tripId: string;
  unplaced: Idea[];
}) {
  const t = useTranslations("MapScreen");
  const tk = useTranslations("Kinds");

  return (
    <div className="flex flex-col gap-1.5 px-0.5 py-1.5 lg:p-0">
      {unplaced.length > 0 && (
        <section
          aria-labelledby="unplaced-ideas"
          className="flex flex-col gap-1.5"
        >
          <h3
            id="unplaced-ideas"
            className="text-muted flex items-center gap-1.5 text-xs font-bold"
          >
            <PinOffIcon className="size-3.5" />
            {t("unplaced", { count: unplaced.length })}
          </h3>
          <ul className="flex flex-col gap-1.5">
            {unplaced.map((idea) => (
              <li key={idea.id}>
                <Link
                  href={`/trips/${tripId}/ideas/${idea.id}`}
                  className="focus-ring border-line hover:border-forest-dark flex h-12 items-center gap-2.5 rounded-[14px] border bg-white pr-2 pl-2.5 transition-colors"
                >
                  <GrowthIcon growth={idea.growth} className="h-[27px] w-5" />
                  <span className="flex min-w-0 grow flex-col">
                    <span
                      className={`text-[11px] leading-[1.2] font-bold ${kindInkClass(idea.kind)}`}
                    >
                      {tk(idea.kind)}
                    </span>
                    <span className="text-ink truncate text-sm leading-[1.25] font-bold">
                      {idea.title}
                    </span>
                  </span>
                  <ChevronRightIcon className="text-muted size-[18px] shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export function EmptyTrip({
  tripId,
  compact = false,
}: {
  tripId: string;
  compact?: boolean;
}) {
  const t = useTranslations("MapScreen");

  return (
    <div
      className={`flex gap-3 ${compact ? "items-start" : "flex-col items-center px-8 pt-14 text-center"}`}
    >
      <GrowthIcon
        growth="seed"
        className={compact ? "h-[59px] w-11" : "h-[85px] w-16"}
      />
      <div
        className={`flex min-w-0 grow flex-col gap-1.5 ${compact ? "" : "items-center"}`}
      >
        <h2 className={`${TITLE} ${compact ? "text-[19px]" : "text-xl"}`}>
          {t("emptyTitle")}
        </h2>
        <p className="text-muted max-w-[300px] text-[13.5px] leading-[1.4] lg:text-sm">
          {t("emptyText")}
        </p>
        {compact && (
          <Link
            href={`/trips/${tripId}/plant`}
            className="focus-ring bg-pinhao text-cream mt-2 flex h-11 items-center justify-center gap-1.5 self-start rounded-[14px] pr-4 pl-3 text-sm font-extrabold"
          >
            <PlusIcon strokeWidth={2.4} className="size-[18px]" />
            {t("emptyAction")}
          </Link>
        )}
      </div>
    </div>
  );
}

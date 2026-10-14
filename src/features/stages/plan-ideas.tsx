"use client";

import { useTranslations } from "next-intl";
import { useOptimistic, useState, useTransition } from "react";
import { GrowthIcon } from "@/components/growth-icon";
import { FireIcon, ThumbDownIcon, ThumbUpIcon } from "@/components/icons";
import { kindInkClass } from "@/components/kind-label";
import { liveGrowth } from "@/features/idea/idea-growth";
import { castVote } from "@/features/trips/actions";
import {
  applyVote,
  points,
  VOTE_VALUES,
  voteCount,
  type VoteState,
} from "@/features/trips/growth";
import type { Idea, VoteValue } from "@/features/trips/types";
import { Link } from "@/i18n/navigation";

const ICONS = { fire: FireIcon, up: ThumbUpIcon, down: ThumbDownIcon };

const ACTIVE: Record<VoteValue, string> = {
  fire: "border-pinhao bg-pinhao-soft text-pinhao",
  up: "border-forest-dark bg-forest-soft text-forest-dark",
  down: "border-muted bg-fog text-ink",
};

const IDLE =
  "border-line bg-[#F1F2EC] text-[#3F4A43] hover:border-muted hover:text-ink";

const RESTING =
  "border-transparent bg-transparent text-muted/70 hover:border-line hover:text-ink";

function useIdeaVote(tripId: string, idea: Idea, rival: number | null) {
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const [votes, apply] = useOptimistic<VoteState, VoteValue>(
    { fire: idea.fire, up: idea.up, down: idea.down, myVote: idea.myVote },
    applyVote,
  );

  function vote(value: VoteValue) {
    setFailed(false);
    startTransition(async () => {
      apply(value);
      const result = await castVote(tripId, idea.id, value).catch(() => null);
      if (!result || "error" in result) setFailed(true);
    });
  }

  return {
    votes,
    growth: liveGrowth(votes, idea, rival),
    vote,
    failed,
    pending,
  };
}

function VoteChoice({
  votes,
  onVote,
  busy,
  size,
}: {
  votes: VoteState;
  onVote: (value: VoteValue) => void;
  busy: boolean;
  size: "icons" | "counts" | "large";
}) {
  const t = useTranslations("Votes");
  const box =
    size === "icons"
      ? "size-[34px] rounded-[11px]"
      : size === "counts"
        ? "h-9 gap-[5px] rounded-xl px-2.5 text-[13px]"
        : "h-[38px] gap-1.5 rounded-xl px-3 text-[13.5px] lg:h-10 lg:rounded-[13px] lg:text-sm";

  return (
    <div
      role="group"
      aria-label={t("group")}
      aria-busy={busy}
      className={`flex shrink-0 ${size === "icons" ? "gap-1" : "gap-1.5"}`}
    >
      {VOTE_VALUES.map((value) => {
        const Icon = ICONS[value];
        const on = votes.myVote === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={on}
            aria-label={t(value, { count: votes[value] })}
            onClick={() => onVote(value)}
            className={`focus-ring flex cursor-pointer items-center justify-center border-[1.5px] font-extrabold transition-colors ${box} ${on ? ACTIVE[value] : votes.myVote ? RESTING : IDLE}`}
          >
            <Icon className="size-4" strokeWidth={2.2} />
            {size !== "icons" && <span>{votes[value]}</span>}
          </button>
        );
      })}
    </div>
  );
}

function VoteError({ show }: { show: boolean }) {
  const t = useTranslations("Votes");
  return show ? (
    <p role="alert" className="text-danger text-xs font-bold">
      {t("error")}
    </p>
  ) : null;
}

export function PlanIdeaRow({
  tripId,
  idea,
  rival,
  rank,
  stage,
  podium = false,
  compact = false,
}: {
  tripId: string;
  idea: Idea;
  rival: number | null;
  rank: number;
  stage?: { name: string; hex: string };
  podium?: boolean;
  compact?: boolean;
}) {
  const t = useTranslations("Plan");
  const tk = useTranslations("Kinds");
  const tt = useTranslations("Trip");
  const { votes, growth, vote, failed, pending } = useIdeaVote(
    tripId,
    idea,
    rival,
  );
  const voted = voteCount(votes) > 0;

  return (
    <li className="border-line/70 flex flex-col gap-1 border-t px-1.5 py-[9px] first:border-t-0">
      <div className="flex items-center gap-2.5">
        <span
          className={`flex size-[22px] shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold ${podium && voted ? (growth === "fire" ? "bg-fire text-cream" : "bg-forest-dark text-cream") : "text-muted"}`}
        >
          <span className="leading-none [text-box:trim-both_cap_alphabetic]">
            {voted ? rank : "·"}
          </span>
        </span>
        <GrowthIcon growth={growth} className="h-[35px] w-[26px]" />
        <Link
          href={`/trips/${tripId}/ideas/${idea.id}`}
          className="focus-ring flex min-w-0 grow flex-col gap-0.5 rounded-lg"
        >
          <span className="text-ink line-clamp-2 text-[14.5px] leading-[1.2] font-bold [overflow-wrap:anywhere] lg:text-[15px]">
            {idea.title}
          </span>
          <span className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5 text-xs leading-[1.2] font-bold">
            {stage ? (
              <span className="text-muted flex min-w-0 items-center gap-[5px]">
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: stage.hex }}
                />
                <span className="truncate">{stage.name}</span>
              </span>
            ) : (
              <span
                className={
                  growth === "fire" ? "text-fire" : kindInkClass(idea.kind)
                }
              >
                {tk(idea.kind)}
              </span>
            )}
            <span className="text-muted">
              {`· ${voted ? tt("points", { count: points(votes) }) : t("noVotes")}`}
            </span>
            {votes.myVote === null && (
              <span className="bg-grass text-forest-dark ml-0.5 inline-flex h-[18px] items-center rounded-full px-[7px] text-[10.5px] font-extrabold">
                {t("toVote")}
              </span>
            )}
          </span>
        </Link>
        <span className={compact ? "" : "lg:hidden"}>
          <VoteChoice votes={votes} onVote={vote} busy={pending} size="icons" />
        </span>
        <span className={compact ? "hidden" : "hidden lg:block"}>
          <VoteChoice
            votes={votes}
            onVote={vote}
            busy={pending}
            size="counts"
          />
        </span>
      </div>
      <VoteError show={failed} />
    </li>
  );
}

export function PlanLeader({
  tripId,
  idea,
  rival,
  stageName,
  hex,
}: {
  tripId: string;
  idea: Idea;
  rival: number | null;
  stageName: string | null;
  hex: string;
}) {
  const t = useTranslations("Plan");
  const tk = useTranslations("Kinds");
  const tt = useTranslations("Trip");
  const { votes, growth, vote, failed, pending } = useIdeaVote(
    tripId,
    idea,
    rival,
  );
  const hot = growth === "fire";

  return (
    <div
      style={
        hot
          ? undefined
          : { backgroundColor: `color-mix(in oklch, ${hex} 12%, #FCFBF6)` }
      }
      className={`border-line flex flex-col gap-3 border-b px-4 py-3.5 lg:flex-row lg:items-center lg:gap-4 lg:px-[18px] lg:py-4 ${hot ? "bg-[linear-gradient(135deg,#FFE6CC_0%,#FFF3E4_55%,#FCFBF6_100%)]" : ""}`}
    >
      <Link
        href={`/trips/${tripId}/ideas/${idea.id}`}
        className="focus-ring flex min-w-0 grow items-center gap-3.5 rounded-xl"
      >
        <GrowthIcon
          growth={growth}
          className="h-[72px] w-[54px] lg:h-20 lg:w-[60px]"
        />
        <span className="flex min-w-0 flex-col gap-[3px]">
          <span
            className="text-xs font-extrabold"
            style={{ color: hot ? undefined : hex }}
          >
            <span className={hot ? "text-fire" : ""}>
              {hot
                ? stageName
                  ? t("winsTrip", { stage: stageName })
                  : t("topTrip")
                : stageName
                  ? t("winsIn", { stage: stageName })
                  : t("winsUnassigned")}
            </span>
          </span>
          <span className="font-display text-ink text-xl leading-[1.15] font-semibold [overflow-wrap:anywhere] lg:text-[22px]">
            {idea.title}
          </span>
          <span className="text-xs font-bold lg:text-[12.5px]">
            <span className={hot ? "text-fire" : kindInkClass(idea.kind)}>
              {tk(idea.kind)}
            </span>
            <span className="text-muted">
              {` · ${t("leaderMeta", {
                points: tt("points", { count: points(votes) }),
                fire: votes.fire,
                up: votes.up,
              })}`}
            </span>
          </span>
        </span>
      </Link>
      <VoteChoice votes={votes} onVote={vote} busy={pending} size="large" />
      <VoteError show={failed} />
    </div>
  );
}

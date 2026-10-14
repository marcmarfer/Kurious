"use client";

import { useTranslations } from "next-intl";
import { useOptimistic, useState, useTransition } from "react";
import { castVote } from "@/features/trips/actions";
import {
  applyVote,
  VOTE_VALUES,
  type VoteState,
} from "@/features/trips/growth";
import type { VoteValue } from "@/features/trips/types";
import { FireIcon, ThumbDownIcon, ThumbUpIcon } from "./icons";

const ICONS = { fire: FireIcon, up: ThumbUpIcon, down: ThumbDownIcon };

const ACTIVE: Record<VoteValue, string> = {
  fire: "border-pinhao bg-pinhao-soft text-pinhao",
  up: "border-forest-dark bg-forest-soft text-forest-dark",
  down: "border-muted bg-muted-soft text-ink",
};

const IDLE = "border-stone bg-cream text-ink hover:border-muted";

const SIZES = {
  compact: {
    button: "h-9 gap-1 rounded-xl px-2.5 text-[13px]",
    icon: "size-4",
    row: "gap-1.5",
  },
  large: {
    button: "h-11 gap-1.5 rounded-[14px] px-[13px] text-sm lg:px-3.5",
    icon: "size-[18px]",
    row: "gap-2",
  },
  hero: {
    button: "h-[46px] gap-1.5 rounded-[14px] px-[15px] text-[15px]",
    icon: "size-[19px]",
    row: "gap-2",
  },
};

export function VoteButtons({
  tripId,
  ideaId,
  fire,
  up,
  down,
  myVote,
  size = "large",
  className = "",
  onVote,
}: {
  tripId: string;
  ideaId: string;
  fire: number;
  up: number;
  down: number;
  myVote: VoteValue | null;
  size?: keyof typeof SIZES;
  className?: string;
  onVote?: (value: VoteValue) => void;
}) {
  const t = useTranslations("Votes");
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const [state, apply] = useOptimistic<VoteState, VoteValue>(
    { fire, up, down, myVote },
    applyVote,
  );
  const s = SIZES[size];

  function vote(value: VoteValue) {
    setFailed(false);
    startTransition(async () => {
      apply(value);
      onVote?.(value);
      const result = await castVote(tripId, ideaId, value).catch(() => null);
      if (!result || "error" in result) setFailed(true);
    });
  }

  return (
    <div className={className}>
      <div
        role="group"
        aria-label={t("group")}
        aria-busy={pending}
        className={`flex items-center ${s.row}`}
      >
        {VOTE_VALUES.map((value) => {
          const Icon = ICONS[value];
          const on = state.myVote === value;
          const count = state[value];
          return (
            <button
              key={value}
              type="button"
              aria-pressed={on}
              aria-label={t(value, { count })}
              onClick={() => vote(value)}
              className={`focus-ring flex shrink-0 cursor-pointer items-center justify-center border-[1.5px] font-extrabold transition-colors ${s.button} ${on ? ACTIVE[value] : IDLE}`}
            >
              <Icon className={s.icon} />
              <span>{count}</span>
            </button>
          );
        })}
      </div>
      <p
        role="status"
        className="text-danger mt-1.5 text-xs font-bold empty:hidden"
      >
        {failed ? t("error") : ""}
      </p>
    </div>
  );
}

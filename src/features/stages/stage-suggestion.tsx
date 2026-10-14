"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { SparkleIcon, SpinnerIcon } from "@/components/icons";
import type { ActionError } from "@/features/trips/actions";
import { assignIdeas } from "@/features/trips/stage-actions";

export function StageSuggestion({
  tripId,
  stageId,
  stageName,
  ideas,
}: {
  tripId: string;
  stageId: string;
  stageName: string;
  ideas: { id: string; title: string }[];
}) {
  const t = useTranslations("Plan.suggest");
  const [pending, start] = useTransition();
  const [error, setError] = useState<ActionError | null>(null);

  return (
    <div className="bg-forest-soft/70 flex flex-col gap-2.5 rounded-2xl px-4 py-3.5">
      <p className="text-forest-dark flex items-start gap-2 text-sm leading-[1.4] font-bold">
        <SparkleIcon className="mt-px size-[18px] shrink-0" />
        <span>{t("title", { count: ideas.length, stage: stageName })}</span>
      </p>
      <p className="text-ink text-[13.5px] leading-[1.45]">
        {ideas.map((idea) => idea.title).join(" · ")}
      </p>
      {error && (
        <p role="alert" className="text-danger text-[13px] font-bold">
          {t(`errors.${error}`)}
        </p>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await assignIdeas(
              tripId,
              stageId,
              ideas.map((idea) => idea.id),
            );
            setError(result.error ?? null);
          })
        }
        className="bg-forest-dark text-cream focus-ring flex h-10 cursor-pointer items-center gap-2 self-start rounded-[13px] px-4 text-[13.5px] font-extrabold disabled:opacity-60"
      >
        {pending && <SpinnerIcon className="size-4 animate-spin" />}
        {t("action", { count: ideas.length, stage: stageName })}
      </button>
    </div>
  );
}

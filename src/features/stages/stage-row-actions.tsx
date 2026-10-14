"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { GripIcon } from "@/components/icons";
import { moveStage } from "@/features/trips/stage-actions";
import { STAGE_HANDLE } from "./sortable-stages";

export function StageGrip({
  tripId,
  stageId,
  name,
}: {
  tripId: string;
  stageId: string;
  name: string;
}) {
  const t = useTranslations("Stages");
  const [, start] = useTransition();
  const move = (up: boolean) =>
    start(async () => {
      await moveStage(tripId, stageId, up);
    });

  return (
    <button
      type="button"
      aria-label={t("dragLabel", { name })}
      title={t("dragHint")}
      onKeyDown={(event) => {
        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
        event.preventDefault();
        move(event.key === "ArrowUp");
      }}
      className={`${STAGE_HANDLE} focus-ring text-muted hover:text-ink flex h-10 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg active:cursor-grabbing lg:w-[26px]`}
    >
      <GripIcon className="size-5" strokeWidth={2.6} />
    </button>
  );
}

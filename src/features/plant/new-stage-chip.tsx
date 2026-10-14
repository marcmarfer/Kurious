"use client";

import { useTranslations } from "next-intl";
import { useId, useState, useTransition } from "react";
import { PlusIcon, SpinnerIcon } from "@/components/icons";
import {
  STAGE_COLORS,
  STAGE_COLOR_KEYS,
  stageColorKey,
  type StageColor,
} from "@/features/trips/stage-colors";
import { quickAddStage } from "@/features/trips/stage-actions";
import { MAX_STAGE_NAME_LENGTH } from "@/features/trips/validation";
import { CHIP, FIELD_ERROR } from "./plant-ui";

export function NewStageChip({
  tripId,
  number,
  point,
  onCreated,
}: {
  tripId: string;
  number: number;
  point: [number, number] | null;
  onCreated: (stageId: string) => void;
}) {
  const t = useTranslations("Plant.stage");
  const ts = useTranslations("Stages");
  const nameId = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState<StageColor>(() =>
    stageColorKey({ color: null }, number - 1),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const hex = STAGE_COLORS[color];

  function close() {
    setOpen(false);
    setName("");
    setError(null);
  }

  function create() {
    if (pending || !name.trim()) return;
    setError(null);
    start(async () => {
      const result = await quickAddStage(tripId, name, point, color).catch(
        () => null,
      );
      if (!result) return setError(ts("errors.generic"));
      if ("fieldError" in result)
        return setError(
          ts(`errors.${result.fieldError}`, { max: MAX_STAGE_NAME_LENGTH }),
        );
      if ("error" in result) return setError(ts(`errors.${result.error}`));
      onCreated(result.id);
      close();
    });
  }

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${CHIP} border-stone bg-cream text-forest-dark hover:border-forest-dark border-dashed`}
      >
        <PlusIcon strokeWidth={2.4} className="size-4" />
        {t("add")}
      </button>
    );

  return (
    <div
      role="group"
      aria-labelledby={nameId}
      className="bg-cream w-full overflow-hidden rounded-[18px] border border-[#E1E3D8] shadow-[0_1px_2px_rgba(31,42,36,.06),0_8px_20px_rgba(31,42,36,.08)]"
    >
      <div
        className="flex items-center gap-3 px-3.5 py-3 transition-colors"
        style={{ backgroundColor: `color-mix(in oklch, ${hex} 32%, #FCFBF6)` }}
      >
        <span
          aria-hidden="true"
          className="text-cream flex size-[26px] shrink-0 items-center justify-center rounded-full text-[12.5px] font-extrabold transition-colors"
          style={{ backgroundColor: hex }}
        >
          <span className="leading-none [text-box:trim-both_cap_alphabetic]">
            {number}
          </span>
        </span>
        <div className="flex min-w-0 grow flex-col">
          <label
            htmlFor={nameId}
            className="text-[11.5px] font-bold text-[#3F4A43]"
          >
            {t("newTitle")}
          </label>
          <input
            id={nameId}
            autoFocus
            value={name}
            maxLength={MAX_STAGE_NAME_LENGTH}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                create();
              }
              if (event.key === "Escape") close();
            }}
            placeholder={t("placeholder")}
            className="font-display text-ink placeholder:text-ink/35 min-w-0 bg-transparent text-xl leading-tight font-semibold outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 px-3.5 pt-3 pb-3.5">
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {STAGE_COLOR_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={color === key}
              aria-label={ts(`color.${key}`)}
              title={ts(`color.${key}`)}
              onClick={() => setColor(key)}
              className={`focus-ring size-7 cursor-pointer rounded-full transition-shadow ${color === key ? "ring-forest-dark ring-2 ring-offset-2 ring-offset-[#FCFBF6]" : ""}`}
              style={{ backgroundColor: STAGE_COLORS[key] }}
            />
          ))}
        </div>
        <p className="text-muted text-[12.5px] leading-[1.35]">
          {point ? t("hintPlaced") : t("hintLater")}
        </p>
        {error && (
          <p role="alert" className={FIELD_ERROR}>
            {error}
          </p>
        )}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="text-muted hover:text-ink focus-ring h-10 cursor-pointer rounded-xl px-3 text-sm font-bold"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={create}
            disabled={pending || !name.trim()}
            className="bg-forest-dark text-cream hover:bg-moss focus-ring flex h-10 cursor-pointer items-center gap-1.5 rounded-xl px-4 text-sm font-extrabold transition-colors disabled:cursor-default disabled:opacity-45"
          >
            {pending ? (
              <SpinnerIcon className="size-4 animate-spin" />
            ) : (
              <PlusIcon strokeWidth={2.4} className="size-4" />
            )}
            {t("create")}
          </button>
        </div>
      </div>
    </div>
  );
}

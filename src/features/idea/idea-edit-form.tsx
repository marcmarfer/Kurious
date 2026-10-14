"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState, useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TrashIcon } from "@/components/icons";
import { Field, FormAlert } from "@/features/auth/form-parts";
import { deleteIdea } from "@/features/trips/removal-actions";
import { updateIdea, type IdeaEditState } from "@/features/trips/actions";
import { CHIP, CHIP_OFF, CHIP_ON } from "@/features/plant/plant-ui";
import { stageHex } from "@/features/trips/stage-colors";
import type { Idea, Stage } from "@/features/trips/types";
import {
  MAX_IDEA_TITLE_LENGTH,
  MAX_NOTE_LENGTH,
} from "@/features/trips/validation";

const MAX = { title: MAX_IDEA_TITLE_LENGTH, note: MAX_NOTE_LENGTH };

export function IdeaEditForm({
  idea,
  stages,
  onDone,
}: {
  idea: Idea;
  stages: Stage[];
  onDone: () => void;
}) {
  const t = useTranslations("IdeaEdit");
  const tr = useTranslations("Removal");
  const locale = useLocale();
  const votes = idea.fire + idea.up + idea.down;
  const [stageId, setStageId] = useState(idea.stageId ?? "");
  const stageOptions = [
    ...stages.map((stage, index) => ({
      id: stage.id,
      label: `${index + 1} · ${stage.name}`,
      hex: stageHex(stage, index) as string | null,
    })),
    { id: "", label: t("noStage"), hex: null },
  ];
  const [state, action, pending] = useActionState<IdeaEditState, FormData>(
    updateIdea.bind(null, idea.tripId, idea.id),
    { status: "idle" },
  );
  const fieldError = (field: "title" | "note") => {
    const error = state.fieldErrors?.[field];
    return error && t(`errors.${error}`, { max: MAX[field] });
  };

  useEffect(() => {
    if (state.status === "saved") onDone();
  }, [state.status, state.savedAt, onDone]);

  return (
    <form action={action} noValidate className="flex flex-col gap-3">
      {state.error && <FormAlert>{t(`errors.${state.error}`)}</FormAlert>}
      <Field
        label={t("title")}
        name="title"
        autoComplete="off"
        maxLength={MAX_IDEA_TITLE_LENGTH}
        defaultValue={idea.title}
        error={fieldError("title")}
        required
      />
      <Field label={t("note")} name="note" error={fieldError("note")}>
        {(props) => (
          <textarea
            id={props.id}
            name={props.name}
            aria-invalid={props["aria-invalid"]}
            aria-describedby={props["aria-describedby"]}
            rows={4}
            maxLength={MAX_NOTE_LENGTH}
            defaultValue={idea.note ?? ""}
            placeholder={t("notePlaceholder")}
            className={`${props.className} h-auto py-3 leading-[1.45]`}
          />
        )}
      </Field>
      {stages.length > 0 && (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-ink mb-1.5 text-sm font-bold">
            {t("stage")}
          </legend>
          <div className="flex flex-wrap gap-2">
            {stageOptions.map((option) => (
              <label
                key={option.id}
                className={`${CHIP} max-w-full ${stageId === option.id ? CHIP_ON : CHIP_OFF}`}
              >
                <input
                  type="radio"
                  name="stageId"
                  value={option.id}
                  checked={stageId === option.id}
                  onChange={() => setStageId(option.id)}
                  className="sr-only"
                />
                {option.hex && (
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: option.hex }}
                  />
                )}
                <span className="truncate">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-pinhao text-cream focus-ring h-11 cursor-pointer rounded-full px-5 font-extrabold disabled:opacity-70"
        >
          {pending ? t("saving") : t("save")}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="text-muted hover:text-ink focus-ring h-11 cursor-pointer rounded-full px-4 font-bold"
        >
          {t("cancel")}
        </button>
        <ConfirmDialog
          title={tr("idea.title")}
          body={
            votes > 0 ? tr("idea.bodyVoted", { count: votes }) : tr("idea.body")
          }
          confirmLabel={tr("idea.action")}
          onConfirm={() => deleteIdea(idea.tripId, idea.id, locale)}
          trigger={(open) => (
            <button
              type="button"
              onClick={open}
              className="text-danger hover:bg-danger-soft focus-ring ml-auto flex h-11 cursor-pointer items-center gap-1.5 rounded-full px-3.5 font-bold"
            >
              <TrashIcon className="size-[18px]" />
              {tr("idea.action")}
            </button>
          )}
        />
      </div>
    </form>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState, type ReactNode } from "react";
import { Collapse } from "@/components/collapse";
import { PencilIcon } from "@/components/icons";
import { Field, FormAlert } from "@/features/auth/form-parts";
import {
  updateName,
  updateTravelerTags,
  type ProfileFormState,
} from "./actions";
import {
  MAX_PROFILE_NAME_LENGTH,
  MAX_TRAVELER_TAGS,
  TRAVELER_TAGS,
  type TravelerTag,
} from "./traveler-tags";
import { TagIcon, TravelerTagChip, tagTone } from "./traveler-tag-chip";

const IDLE: ProfileFormState = { status: "idle" };

function useEditor(
  action: (
    state: ProfileFormState,
    data: FormData,
  ) => Promise<ProfileFormState>,
) {
  const [state, submit, pending] = useActionState(action, IDLE);
  const [editing, setEditing] = useState(false);
  const [handled, setHandled] = useState(state.savedAt);
  if (state.savedAt !== handled) {
    setHandled(state.savedAt);
    setEditing(false);
  }
  return { state, submit, pending, editing, setEditing };
}

function EditButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  const t = useTranslations("Settings");
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="border-stone text-ink hover:border-forest-dark focus-ring flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] bg-white px-3.5 text-sm font-extrabold"
    >
      <PencilIcon className="size-4" strokeWidth={2.2} />
      <span>{t("editShort")}</span>
    </button>
  );
}

function EditorActions({
  pending,
  onCancel,
}: {
  pending: boolean;
  onCancel: () => void;
}) {
  const t = useTranslations("Settings");
  return (
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
        onClick={onCancel}
        className="text-muted hover:text-ink focus-ring h-11 cursor-pointer rounded-full px-4 font-bold"
      >
        {t("cancel")}
      </button>
    </div>
  );
}

function Saved({ show }: { show: boolean }) {
  const t = useTranslations("Settings");
  if (!show) return null;
  return (
    <p role="status" className="text-forest-dark text-sm font-bold">
      {t("saved")}
    </p>
  );
}

export function NameEditor({
  name,
  email,
  avatar,
}: {
  name: string;
  email: string;
  avatar: ReactNode;
}) {
  const t = useTranslations("Settings");
  const { state, submit, pending, editing, setEditing } = useEditor(updateName);

  return (
    <div>
      <Collapse open={editing}>
        <form
          key={name}
          action={submit}
          noValidate
          className="flex flex-col gap-3"
        >
          {state.error && <FormAlert>{t(`errors.${state.error}`)}</FormAlert>}
          <Field
            label={t("name")}
            name="name"
            autoComplete="name"
            maxLength={MAX_PROFILE_NAME_LENGTH}
            defaultValue={name}
            error={state.nameError && t(`errors.${state.nameError}`)}
            required
          />
          <EditorActions pending={pending} onCancel={() => setEditing(false)} />
        </form>
      </Collapse>
      <Collapse open={!editing}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            {avatar}
            <div className="flex min-w-0 grow flex-col">
              <h2
                id="settings-profile"
                className="font-display text-ink truncate text-xl font-semibold"
              >
                {name || email}
              </h2>
              <p className="text-muted truncate text-sm">{email}</p>
            </div>
            <EditButton
              label={t("editName")}
              onClick={() => setEditing(true)}
            />
          </div>
          <Saved show={state.status === "saved"} />
        </div>
      </Collapse>
    </div>
  );
}

export function TagsEditor({ tags }: { tags: TravelerTag[] }) {
  const t = useTranslations("Settings");
  const tt = useTranslations("TravelerTags");
  const { state, submit, pending, editing, setEditing } =
    useEditor(updateTravelerTags);
  const [picked, setPicked] = useState<TravelerTag[]>(tags);
  const full = picked.length >= MAX_TRAVELER_TAGS;

  const toggle = (tag: TravelerTag) =>
    setPicked((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : current.length < MAX_TRAVELER_TAGS
          ? [...current, tag]
          : current,
    );

  return (
    <div>
      <Collapse open={editing}>
        <form action={submit} className="flex flex-col gap-3">
          {state.error && <FormAlert>{t(`errors.${state.error}`)}</FormAlert>}
          <fieldset className="flex flex-col gap-2">
            <legend className="text-ink text-sm font-bold">
              {t("tagsTitle")}
            </legend>
            <p className="text-muted -mt-0.5 text-sm">
              {t("tagsHint", { max: MAX_TRAVELER_TAGS })}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {TRAVELER_TAGS.map((tag) => {
                const on = picked.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={on}
                    disabled={!on && full}
                    onClick={() => toggle(tag)}
                    className={`focus-ring flex h-9 cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] px-3.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${on ? tagTone(tag).solid : "border-stone text-ink hover:border-forest-dark bg-white"}`}
                  >
                    <TagIcon
                      tag={tag}
                      className={`size-3.5 ${on ? "" : tagTone(tag).ink}`}
                    />
                    {tt(tag)}
                  </button>
                );
              })}
            </div>
            {picked.map((tag) => (
              <input key={tag} type="hidden" name="tags" value={tag} />
            ))}
          </fieldset>
          <EditorActions pending={pending} onCancel={() => setEditing(false)} />
        </form>
      </Collapse>
      <Collapse open={!editing}>
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <div className="flex min-w-0 grow flex-col gap-1">
              <span className="text-muted text-sm font-bold">
                {t("tagsTitle")}
              </span>
              {tags.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag) => (
                    <li key={tag}>
                      <TravelerTagChip tag={tag} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted text-sm">{t("noTags")}</p>
              )}
            </div>
            <EditButton
              label={t("editTags")}
              onClick={() => {
                setPicked(tags);
                setEditing(true);
              }}
            />
          </div>
          <Saved show={state.status === "saved"} />
        </div>
      </Collapse>
    </div>
  );
}

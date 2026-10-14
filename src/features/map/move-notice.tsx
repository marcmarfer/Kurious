"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { CloseIcon, RedoIcon, UndoIcon } from "@/components/icons";
import type { MoveNoticeState } from "./use-idea-moves";

const VISIBLE_MS = 7000;

const ARROW =
  "text-ink hover:bg-fog focus-ring flex size-10 cursor-pointer items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

export function MoveControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  className = "",
}: {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  className?: string;
}) {
  const t = useTranslations("Moves");
  if (!canUndo && !canRedo) return null;

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={`bg-cream/95 pointer-events-auto absolute z-30 flex items-center gap-0.5 rounded-full border border-white/60 p-1 shadow-[0_6px_18px_rgba(10,20,15,.22)] backdrop-blur-[12px] ${className}`}
    >
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label={t("undo")}
        title={t("undoHint")}
        className={ARROW}
      >
        <UndoIcon className="size-5" strokeWidth={2.2} />
      </button>
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        aria-label={t("redo")}
        title={t("redoHint")}
        className={ARROW}
      >
        <RedoIcon className="size-5" strokeWidth={2.2} />
      </button>
    </div>
  );
}

export function MoveNotice({
  notice,
  onDismiss,
  className = "top-[calc(env(safe-area-inset-top)+80px)] lg:top-6",
}: {
  notice: MoveNoticeState | null;
  onDismiss: () => void;
  className?: string;
}) {
  const t = useTranslations("Moves");
  const failed = notice?.kind === "failed" ? notice : null;

  useEffect(() => {
    if (!failed) return;
    const timer = setTimeout(onDismiss, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [failed, onDismiss]);

  if (!failed) return null;

  return (
    <div
      role="alert"
      className={`bg-forest-dark text-cream pointer-events-auto absolute left-1/2 z-40 flex h-12 -translate-x-1/2 items-center gap-1 rounded-full pr-1.5 pl-5 text-sm font-bold whitespace-nowrap shadow-[0_8px_24px_rgba(31,42,36,.35)] ${className}`}
    >
      <span className="pr-2">{t(`errors.${failed.error ?? "generic"}`)}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t("dismiss")}
        className="hover:bg-cream/10 focus-ring flex size-9 cursor-pointer items-center justify-center rounded-full"
      >
        <CloseIcon className="size-[18px]" />
      </button>
    </div>
  );
}

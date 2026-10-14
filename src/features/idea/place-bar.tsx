"use client";

import { useTranslations } from "next-intl";
import { PinIcon, SpinnerIcon } from "@/components/icons";

export function PlaceBar({
  ready,
  pending,
  onSave,
  onCancel,
}: {
  ready: boolean;
  pending: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("Idea.place");

  return (
    <div className="bg-cream/95 absolute inset-x-3 bottom-[38px] flex flex-col gap-2 rounded-[20px] border border-white/60 p-2.5 shadow-[0_8px_24px_rgba(10,20,15,.28)] backdrop-blur-[12px] lg:inset-x-auto lg:bottom-6 lg:left-6 lg:w-[380px]">
      <p
        aria-live="polite"
        className="text-ink flex items-center gap-2 px-1 text-[13px] leading-[1.3] font-bold"
      >
        <span className="bg-forest-dark text-cream flex size-6 shrink-0 items-center justify-center rounded-full">
          <PinIcon className="size-3.5" strokeWidth={2.4} />
        </span>
        {ready ? t("hintMove") : t("hintTap")}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-muted hover:text-ink focus-ring border-line h-11 flex-1 cursor-pointer rounded-full border bg-white px-4 font-bold"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!ready || pending}
          aria-busy={pending || undefined}
          className="bg-pinhao text-cream focus-ring flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-4 font-extrabold disabled:cursor-not-allowed disabled:opacity-45"
        >
          {pending && <SpinnerIcon className="size-4 animate-spin" />}
          {pending ? t("saving") : t("save")}
        </button>
      </div>
    </div>
  );
}

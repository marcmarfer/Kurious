"use client";

import { useTranslations } from "next-intl";
import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  AVATAR_COLORS,
  Avatar,
  avatarColor,
  type AvatarColor,
} from "@/components/avatar";
import { PencilIcon } from "@/components/icons";
import { updateAvatarColor } from "./actions";

const KEYS = Object.keys(AVATAR_COLORS) as AvatarColor[];

export function AvatarColorPicker({
  name,
  color,
}: {
  name: string;
  color: AvatarColor | null;
}) {
  const t = useTranslations("Settings");
  const tc = useTranslations("AvatarColors");
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useOptimistic(color);
  const [, startTransition] = useTransition();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (event.target instanceof Node && root.current?.contains(event.target))
        return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const pick = (next: AvatarColor | null) =>
    startTransition(async () => {
      setShown(next);
      setOpen(false);
      await updateAvatarColor(next);
    });

  const swatch = (key: AvatarColor | null) => {
    const on = shown === key;
    return (
      <button
        key={key ?? "auto"}
        type="button"
        aria-pressed={on}
        aria-label={key ? tc(key) : t("avatarAuto")}
        title={key ? tc(key) : t("avatarAuto")}
        onClick={() => pick(key)}
        className={`focus-ring text-cream flex size-9 cursor-pointer items-center justify-center rounded-full text-xs font-extrabold ${on ? "ring-forest-dark ring-offset-cream ring-2 ring-offset-2" : ""}`}
        style={{
          backgroundColor: key ? AVATAR_COLORS[key] : avatarColor(name),
        }}
      >
        {key ? null : "A"}
      </button>
    );
  };

  return (
    <div ref={root} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-label={t("avatarColor")}
        onClick={() => setOpen((value) => !value)}
        className="focus-ring relative block cursor-pointer rounded-full"
      >
        <Avatar name={name} color={shown} className="size-14 text-xl" />
        <span className="border-cream bg-forest-dark text-cream absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border-2">
          <PencilIcon className="size-3" strokeWidth={2.6} />
        </span>
      </button>
      {open && (
        <div className="border-line bg-cream shadow-card absolute top-full left-0 z-20 mt-2 flex w-[232px] flex-col gap-2 rounded-2xl border p-3">
          <span className="text-ink text-sm font-bold">{t("avatarColor")}</span>
          <div className="flex flex-wrap gap-2">
            {swatch(null)}
            {KEYS.map((key) => swatch(key))}
          </div>
        </div>
      )}
    </div>
  );
}

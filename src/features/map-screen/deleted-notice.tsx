"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { CloseIcon } from "@/components/icons";
import { restoreIdea } from "@/features/trips/removal-actions";
import { useRouter } from "@/i18n/navigation";

const VISIBLE_MS = 8000;

export function DeletedNotice({
  tripId,
  ideaId,
}: {
  tripId: string;
  ideaId: string;
}) {
  const t = useTranslations("Removal");
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const tripPath = `/trips/${tripId}`;

  useEffect(() => {
    if (pending) return;
    const timer = setTimeout(
      () => router.replace(tripPath, { scroll: false }),
      VISIBLE_MS,
    );
    return () => clearTimeout(timer);
  }, [pending, router, tripPath]);

  const undo = () =>
    startTransition(async () => {
      const result = await restoreIdea(tripId, ideaId);
      if (result.error) setFailed(true);
      else router.replace(`${tripPath}?idea=${ideaId}`, { scroll: false });
    });

  return (
    <div
      role="status"
      className="bg-forest-dark text-cream pointer-events-auto absolute top-[calc(env(safe-area-inset-top)+80px)] left-1/2 z-40 flex h-12 -translate-x-1/2 items-center gap-1 rounded-full pr-1.5 pl-5 text-sm font-bold whitespace-nowrap shadow-[0_8px_24px_rgba(31,42,36,.35)] lg:top-6"
    >
      <span className="pr-2">
        {failed ? t("idea.undoFailed") : t("idea.deleted")}
      </span>
      {!failed && (
        <button
          type="button"
          onClick={undo}
          disabled={pending}
          className="text-grass hover:bg-cream/10 focus-ring h-9 cursor-pointer rounded-full px-3 font-extrabold disabled:opacity-60"
        >
          {t("idea.undo")}
        </button>
      )}
      <button
        type="button"
        onClick={() => router.replace(tripPath, { scroll: false })}
        aria-label={t("idea.dismiss")}
        className="hover:bg-cream/10 focus-ring flex size-9 cursor-pointer items-center justify-center rounded-full"
      >
        <CloseIcon className="size-[18px]" />
      </button>
    </div>
  );
}

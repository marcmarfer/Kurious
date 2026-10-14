"use client";

import { useTranslations } from "next-intl";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import type { RemovalResult } from "@/features/trips/removal-actions";

export function ConfirmDialog({
  trigger,
  title,
  body,
  confirmLabel,
  typeToConfirm,
  onConfirm,
}: {
  trigger: (open: () => void) => ReactNode;
  title: string;
  body: string;
  confirmLabel: string;
  typeToConfirm?: string;
  onConfirm: () => Promise<RemovalResult | void>;
}) {
  const t = useTranslations("Removal");
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const inputId = useId();
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const blocked =
    pending || (typeToConfirm !== undefined && typed.trim() !== typeToConfirm);

  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (shown && !node.open) node.showModal();
    if (!shown && node.open) node.close();
  }, [shown]);

  const open = () => {
    setTyped("");
    setError(null);
    setShown(true);
  };
  const confirm = () =>
    startTransition(async () => {
      const result = await onConfirm();
      if (result?.error) setError(t(`errors.${result.error}`));
      else setShown(false);
    });

  return (
    <>
      {trigger(open)}
      <dialog
        ref={dialog}
        onClose={() => setShown(false)}
        aria-labelledby={titleId}
        className="bg-cream border-line shadow-card m-auto w-[min(420px,calc(100vw-32px))] rounded-[22px] border p-0 backdrop:bg-[rgba(31,42,36,.45)]"
      >
        <div className="flex flex-col gap-3 p-6">
          <h2
            id={titleId}
            className="font-display text-ink text-xl leading-tight font-semibold"
          >
            {title}
          </h2>
          <p className="text-muted text-[15px] leading-[1.5]">{body}</p>
          {typeToConfirm !== undefined && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor={inputId} className="text-ink text-sm font-bold">
                {t("typeToConfirm", { text: typeToConfirm })}
              </label>
              <input
                id={inputId}
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                autoComplete="off"
                className="border-line text-ink focus-ring h-11 rounded-xl border bg-white px-3"
              />
            </div>
          )}
          {error && (
            <p
              role="alert"
              className="bg-danger-soft text-danger rounded-xl px-3 py-2 text-sm font-semibold"
            >
              {error}
            </p>
          )}
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setShown(false)}
              className="border-line text-ink hover:border-forest-dark focus-ring h-11 cursor-pointer rounded-full border bg-white px-5 font-bold"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={blocked}
              className="bg-danger text-cream focus-ring h-11 cursor-pointer rounded-full px-5 font-bold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? t("pending") : confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

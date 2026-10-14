"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { CloseIcon, LinkIcon, PinIcon, PlayIcon } from "@/components/icons";
import { MAX_URL_LENGTH } from "@/features/trips/validation";
import { linkPreview, type LinkKind } from "./link-preview";
import { FIELD_ERROR } from "./plant-ui";

const CARD =
  "flex items-start gap-3 rounded-[18px] border border-[#E4E2D8] bg-white py-3 pr-3.5 pl-3 shadow-[0_2px_10px_rgba(31,42,36,.06)]";

function Tile({ kind }: { kind: LinkKind | null }) {
  if (kind === "video")
    return (
      <span className="flex h-[58px] w-11 shrink-0 items-center justify-center rounded-[10px] bg-[linear-gradient(160deg,#2A3F36_0%,#12201A_100%)]">
        <PlayIcon className="text-cream size-5" />
      </span>
    );
  return (
    <span
      className={`bg-frost text-forest-dark flex w-11 shrink-0 items-center justify-center rounded-[10px] ${kind ? "h-[58px]" : "h-11"}`}
    >
      {kind === "map" ? (
        <PinIcon className="size-5" />
      ) : (
        <LinkIcon className="size-5" strokeWidth={2.2} />
      )}
    </span>
  );
}

export function LinkField({
  value,
  onChange,
  title,
  serverError,
}: {
  value: string;
  onChange: (value: string) => void;
  title: string;
  serverError: string | null;
}) {
  const t = useTranslations("Plant");
  const inputId = useId();
  const errorId = useId();
  const [editing, setEditing] = useState(false);
  const preview = linkPreview(value);
  const showInput = editing || !preview;
  const invalid = !editing && value.trim() !== "" && !preview;
  const error = invalid ? t("errors.urlInvalid") : serverError;

  return (
    <div className="flex flex-col gap-1.5">
      <input type="hidden" name="sourceUrl" value={value} />
      {showInput ? (
        <div
          className={`${CARD} focus-within:border-forest-dark items-center transition-colors ${error ? "border-danger" : ""}`}
        >
          <Tile kind={null} />
          <div className="flex min-w-0 grow flex-col gap-0.5">
            <label
              htmlFor={inputId}
              className="text-muted text-xs leading-[1.2] font-bold"
            >
              {t("link.label")} · {t("link.optional")}
            </label>
            <input
              id={inputId}
              ref={(el) => {
                if (el && editing && preview) el.focus();
              }}
              type="text"
              inputMode="url"
              autoComplete="off"
              maxLength={MAX_URL_LENGTH}
              value={value}
              placeholder={t("link.placeholder")}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              onChange={(event) => onChange(event.target.value)}
              onFocus={() => setEditing(true)}
              onBlur={() => setEditing(false)}
              onPaste={(event) => {
                const input = event.currentTarget;
                requestAnimationFrame(() => input.blur());
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                event.currentTarget.blur();
              }}
              className="text-ink placeholder:text-muted/80 h-7 w-full min-w-0 bg-transparent text-[14.5px] font-semibold outline-none"
            />
          </div>
        </div>
      ) : (
        <div className={CARD}>
          <Tile kind={preview.kind} />
          <div className="flex min-w-0 grow flex-col gap-[5px]">
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label={`${t("link.edit")}: ${preview.line}`}
              className="focus-ring text-muted hover:text-ink cursor-pointer truncate rounded text-left text-xs leading-[1.2] font-bold"
            >
              {preview.line}
            </button>
            {title.trim() ? (
              <span className="font-display text-ink text-[15px] leading-[1.35] font-medium [overflow-wrap:anywhere]">
                «{title.trim()}»
              </span>
            ) : (
              <span className="text-muted/80 text-sm leading-[1.35] font-semibold">
                {t("link.untitled")}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label={t("link.remove")}
            className="focus-ring text-muted hover:bg-frost hover:text-ink -mt-1 -mr-1.5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors"
          >
            <CloseIcon className="size-4" strokeWidth={2.2} />
          </button>
        </div>
      )}
      {error && (
        <p id={errorId} className={`${FIELD_ERROR} px-1`}>
          {error}
        </p>
      )}
    </div>
  );
}

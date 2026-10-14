"use client";

import { useTranslations } from "next-intl";
import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronDownIcon, PencilIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";

const ROWS_SHOWN = 3;

export function StageCard({
  name,
  hex,
  numbered,
  subline,
  foldedSubline,
  pending,
  total,
  open: startOpen,
  grip,
  editHref,
  leader,
  rows,
  footer,
}: {
  name: string;
  hex: string;
  numbered: boolean;
  subline: string;
  foldedSubline: string | null;
  pending: number;
  total: number;
  open: boolean;
  grip: ReactNode;
  editHref: string | null;
  leader: ReactNode;
  rows: ReactNode[];
  footer: ReactNode;
}) {
  const t = useTranslations("Plan");
  const ts = useTranslations("Stages");
  const [open, setOpen] = useState(startOpen);
  const [all, setAll] = useState(false);
  const body = useId();
  const shown = all ? rows : rows.slice(0, ROWS_SHOWN);
  const hidden = rows.length - ROWS_SHOWN;

  const toggle = () => setOpen((value) => !value);
  const deep = `color-mix(in oklch, ${hex} 70%, #1F2A24)`;

  return (
    <div
      className="bg-cream border-line shadow-card text-ink flex flex-col overflow-hidden rounded-[inherit] border"
      style={{ "--stage": hex } as CSSProperties}
    >
      <header className="flex items-center gap-2 py-2.5 pr-2 pl-1 lg:py-3 lg:pr-3 lg:pl-1.5">
        {grip ?? (
          <span aria-hidden="true" className="w-6 shrink-0 lg:w-[26px]" />
        )}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={body}
          onClick={toggle}
          className="focus-ring flex min-w-0 grow cursor-pointer items-center gap-2.5 rounded-xl py-0.5 text-left lg:gap-3"
        >
          <span
            aria-hidden="true"
            className={`text-cream flex size-[22px] shrink-0 items-center justify-center rounded-full text-[11.5px] leading-none font-extrabold lg:size-6 lg:text-xs ${numbered ? "before:leading-none before:content-[counter(stage)] before:[text-box:trim-both_cap_alphabetic]" : ""}`}
            style={{ backgroundColor: hex }}
          />
          <span className="flex min-w-0 grow flex-col">
            <span
              className="font-display text-lg leading-[1.2] font-semibold [overflow-wrap:anywhere] lg:text-[19px]"
              style={{ color: deep }}
            >
              {name}
            </span>
            <span className="text-muted truncate text-[12.5px] font-semibold lg:text-[13px]">
              {!open && foldedSubline ? foldedSubline : subline}
            </span>
          </span>
          <span
            className={`flex h-6 shrink-0 items-center rounded-full px-2.5 text-[11.5px] font-extrabold whitespace-nowrap lg:h-[26px] lg:text-xs ${pending > 0 ? "" : "stage-tag"}`}
            style={
              pending > 0
                ? { backgroundColor: hex, color: "#FCFBF6" }
                : { color: deep }
            }
          >
            {total === 0
              ? t("noIdeas")
              : pending > 0
                ? t("pending", { count: pending })
                : t("allVoted")}
          </span>
        </button>
        {editHref && (
          <Link
            href={editHref}
            aria-label={ts("editLabel", { name })}
            title={ts("editLabel", { name })}
            className="focus-ring text-ink hover:bg-fog flex size-9 shrink-0 items-center justify-center rounded-full"
          >
            <PencilIcon className="size-[18px]" />
          </Link>
        )}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={body}
          aria-label={open ? t("fold", { name }) : t("unfold", { name })}
          onClick={toggle}
          className="focus-ring text-ink hover:bg-fog flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#F1F2EC] lg:size-[30px]"
        >
          <ChevronDownIcon
            strokeWidth={2.4}
            className={`size-[18px] transition-transform ${open ? "" : "-rotate-90"}`}
          />
        </button>
      </header>
      <div
        id={body}
        hidden={!open}
        className="border-line/70 flex flex-col border-t"
      >
        {leader}
        {shown.length > 0 && (
          <ol className="flex flex-col px-2 pt-1 pb-2 lg:px-3">{shown}</ol>
        )}
        {hidden > 0 && (
          <button
            type="button"
            onClick={() => setAll((value) => !value)}
            className="focus-ring text-forest-dark hover:bg-fog mx-2 mb-2 h-[38px] cursor-pointer rounded-xl bg-[#F1F2EC] text-[13.5px] font-extrabold lg:mx-3"
          >
            {all ? t("less") : t("more", { count: hidden })}
          </button>
        )}
        {footer}
      </div>
    </div>
  );
}

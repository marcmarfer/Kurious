import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { KindDot } from "@/components/kind-label";
import type { Idea } from "@/features/trips/types";

export function IdeaList({
  ideas,
  selectedId,
  onSelect,
  pointsText,
  bylineText,
}: {
  ideas: Idea[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  pointsText: (idea: Idea) => string;
  bylineText: (idea: Idea) => string;
}) {
  const tg = useTranslations("Growth");
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!selectedId) return;
    const row = listRef.current?.querySelector<HTMLElement>(
      `[data-idea="${CSS.escape(selectedId)}"]`,
    );
    row?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId]);

  return (
    <ul
      ref={listRef}
      className="flex min-h-0 grow flex-col gap-1 overflow-y-auto px-3 pb-4"
    >
      {ideas.map((idea) => {
        const on = idea.id === selectedId;
        const hot = idea.growth === "fire";
        return (
          <li key={idea.id} data-idea={idea.id}>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(idea.id)}
              className={`focus-ring flex w-full cursor-pointer items-center gap-3 rounded-[14px] border-[1.5px] px-3 py-2.5 text-left transition-colors ${on ? "border-forest-dark bg-forest-soft/40" : "hover:bg-forest-soft/25 border-transparent"}`}
            >
              <KindDot kind={idea.kind} className="size-2.5" />
              <span className="flex min-w-0 grow flex-col gap-[3px]">
                <span className="font-display text-ink line-clamp-2 text-[15.5px] leading-[1.25] font-semibold">
                  {idea.title}
                </span>
                <span className="text-muted truncate text-[12.5px] leading-[1.2] font-semibold">
                  {bylineText(idea)}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-[3px]">
                <span
                  className={`text-sm leading-none font-extrabold ${hot ? "text-fire" : "text-ink"}`}
                >
                  {pointsText(idea)}
                </span>
                <span
                  className={`text-[11.5px] leading-none font-bold ${hot ? "text-fire" : "text-moss"}`}
                >
                  {tg(idea.growth)}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

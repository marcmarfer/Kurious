import { useTranslations } from "next-intl";
import { KindDot } from "@/components/kind-label";
import { KIND_FILTERS, type KindFilter } from "./selection";

const VARIANTS = {
  floating: {
    row: "-my-2 flex items-center gap-1.5 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    chip: "h-[34px] shrink-0 px-3 text-xs first:px-3.5",
    on: "border-forest-dark bg-forest-dark text-cream font-bold shadow-[0_4px_12px_rgba(31,42,36,.25)]",
    off: "bg-cream/90 text-ink border-white/60 font-semibold shadow-[0_4px_12px_rgba(31,42,36,.16)] backdrop-blur-md",
  },
  panel: {
    row: "flex flex-wrap gap-1.5",
    chip: "h-[34px] px-3 text-[12.5px] font-bold",
    on: "border-forest-dark bg-forest-dark text-cream",
    off: "border-stone bg-cream text-ink hover:border-muted",
  },
};

export function KindChips({
  kind,
  counts,
  onChange,
  variant,
  className = "",
}: {
  kind: KindFilter;
  counts: Record<KindFilter, number>;
  onChange: (kind: KindFilter) => void;
  variant: keyof typeof VARIANTS;
  className?: string;
}) {
  const t = useTranslations("MapScreen");
  const tk = useTranslations("Kinds");
  const v = VARIANTS[variant];

  return (
    <div
      role="group"
      aria-label={t("filterLabel")}
      className={`${v.row} ${className}`}
    >
      {KIND_FILTERS.map((option) => {
        const on = option === kind;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(option)}
            className={`focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-full border whitespace-nowrap transition-colors ${v.chip} ${on ? v.on : v.off}`}
          >
            {option !== "all" && (
              <KindDot
                kind={option}
                className={on ? "ring-cream/80 size-2 ring-[1.5px]" : "size-2"}
              />
            )}
            {t("chip", {
              label: option === "all" ? t("all") : tk(`plural.${option}`),
              count: counts[option],
            })}
          </button>
        );
      })}
    </div>
  );
}

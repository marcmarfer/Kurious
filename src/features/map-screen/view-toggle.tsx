import { useTranslations } from "next-intl";
import { GlobeIcon, MapIcon } from "@/components/icons";

export type ViewMode = "2d" | "3d";

const OPTIONS = [
  { mode: "2d", key: "map2d", Icon: MapIcon },
  { mode: "3d", key: "globe3d", Icon: GlobeIcon },
] as const;

export function ViewToggle({
  mode,
  onChange,
  className = "",
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}) {
  const t = useTranslations("Map3d");

  return (
    <div
      role="group"
      aria-label={t("viewLabel")}
      className={`bg-cream/90 flex h-10 items-center gap-0.5 rounded-full border border-white/60 p-[3px] shadow-[0_6px_18px_rgba(31,42,36,.25)] backdrop-blur-[14px] lg:h-11 lg:p-1 lg:shadow-[0_6px_18px_rgba(31,42,36,.22)] ${className}`}
    >
      {OPTIONS.map(({ mode: option, key, Icon }) => {
        const on = option === mode;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(option)}
            className={`focus-ring flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-[13px] text-[12.5px] font-extrabold whitespace-nowrap transition-colors lg:h-[34px] lg:px-3.5 lg:text-[13px] ${on ? "bg-forest-dark text-cream" : "text-ink hover:bg-forest-soft/60"}`}
          >
            <Icon className="size-4" />
            <span>{t(key)}</span>
          </button>
        );
      })}
    </div>
  );
}

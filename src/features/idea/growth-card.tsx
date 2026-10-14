import { useTranslations } from "next-intl";
import { GrowthIcon } from "@/components/growth-icon";
import { GROWTH_ORDER, growthStep } from "@/features/trips/growth";
import type { Growth } from "@/features/trips/types";

const TONES = {
  fire: {
    card: "border-[#F6B98A] bg-[linear-gradient(135deg,#FFE6CC_0%,#FFF3E4_55%,#EEF4E6_100%)] shadow-[0_6px_18px_rgba(240,122,42,.16)]",
    title: "text-fire",
    text: "text-[#5F4B3C]",
    unit: "text-[#7A5A45]",
    current: "text-fire",
  },
  calm: {
    card: "border-[#C9DDBB] bg-[linear-gradient(135deg,#E3EFD8_0%,#F1F6EA_55%,#FCFBF6_100%)] shadow-[0_6px_18px_rgba(46,106,78,.12)]",
    title: "text-forest-dark",
    text: "text-[#3F4A43]",
    unit: "text-muted",
    current: "text-forest-dark",
  },
};

const TRACK_LINE = "absolute inset-x-[10%] top-9 h-[3px] rounded-sm";

export function GrowthCard({
  growth,
  points,
  text,
}: {
  growth: Growth;
  points: number;
  text: string;
}) {
  const t = useTranslations("Idea");
  const tg = useTranslations("Growth");
  const tone = growth === "fire" ? TONES.fire : TONES.calm;
  const step = growthStep(growth);
  const last = GROWTH_ORDER.length - 1;

  return (
    <section
      aria-label={t("growthLabel")}
      className={`flex flex-col gap-3 rounded-[20px] border-[1.5px] py-3.5 pr-4 pb-3 pl-3 ${tone.card}`}
    >
      <div className="flex items-center gap-3">
        <GrowthIcon growth={growth} className="h-[69px] w-[52px]" />
        <div className="flex min-w-0 grow flex-col gap-[3px]">
          <h2
            className={`font-display text-lg leading-[1.15] font-semibold ${tone.title}`}
          >
            {tg(growth)}
          </h2>
          <p className={`text-[13px] leading-[1.35] ${tone.text}`}>{text}</p>
        </div>
        <p className="flex min-w-[52px] shrink-0 flex-col items-center">
          <span
            className={`font-display text-[30px] leading-none font-bold ${tone.title}`}
          >
            {points}
          </span>
          <span className={`text-[11px] leading-[1.3] font-bold ${tone.unit}`}>
            {t("pointsUnit", { count: points })}
          </span>
        </p>
      </div>
      <div
        role="img"
        aria-label={t("trackLabel", { growth: tg(growth) })}
        className="relative grid grid-cols-5"
      >
        <span aria-hidden="true" className={`${TRACK_LINE} bg-stone`} />
        <span
          aria-hidden="true"
          className={`${TRACK_LINE} bg-[linear-gradient(90deg,#B4532B_0%,#3E9A4A_28%,#2F8A43_72%,#FF8A1F_100%)]`}
          style={{ clipPath: `inset(0 ${((last - step) / last) * 100}% 0 0)` }}
        />
        {GROWTH_ORDER.map((item, i) => {
          const current = i === step;
          return (
            <span
              key={item}
              className={`relative flex flex-col items-center gap-1.5 ${i > step ? "opacity-45 grayscale-[.5]" : ""}`}
            >
              <span className="flex h-[38px] items-end">
                <GrowthIcon
                  growth={item}

                  className={`${current ? "h-10 w-[30px]" : "h-[35px] w-[26px]"}`}
                />
              </span>
              <span
                className={`text-[10.5px] leading-none whitespace-nowrap ${current ? `font-extrabold ${tone.current}` : "text-muted font-bold"}`}
              >
                {item === "fire" ? tg("fireShort") : tg(item)}
              </span>
            </span>
          );
        })}
      </div>
    </section>
  );
}

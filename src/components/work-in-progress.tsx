import { useTranslations } from "next-intl";
import { CubeIcon } from "./icons";

export function WorkInProgress({
  feature,
  onBack,
  className = "",
}: {
  feature: "globe";
  onBack: () => void;
  className?: string;
}) {
  const t = useTranslations("WorkInProgress");

  return (
    <div
      className={`bg-paper flex items-center justify-center p-6 ${className}`}
    >
      <section className="border-line bg-cream shadow-card pointer-events-auto flex max-w-sm flex-col items-center gap-3 rounded-[22px] border px-6 py-8 text-center">
        <span className="bg-pinhao-soft text-pinhao flex size-14 items-center justify-center rounded-full">
          <CubeIcon className="size-7" />
        </span>
        <h2 className="font-display text-ink text-2xl font-semibold">
          {t("title")}
        </h2>
        <p className="text-muted">{t(feature)}</p>
        <button
          type="button"
          onClick={onBack}
          className="bg-forest-dark text-cream focus-ring mt-1 h-11 cursor-pointer rounded-full px-5 font-bold"
        >
          {t("back")}
        </button>
      </section>
    </div>
  );
}

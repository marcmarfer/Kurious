import { useTranslations } from "next-intl";

export function ScreenSkeleton({ variant }: { variant: "map" | "list" }) {
  const t = useTranslations("Nav");

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-paper absolute inset-0 flex flex-col gap-4 p-4 sm:p-6"
    >
      <span className="sr-only">{t("loading")}</span>
      <div className="border-line bg-cream/95 shadow-card h-16 w-full max-w-sm animate-pulse rounded-2xl border" />
      {variant === "list" && (
        <div className="flex w-full max-w-2xl flex-col gap-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="border-line bg-cream h-24 animate-pulse rounded-[22px] border"
            />
          ))}
        </div>
      )}
    </div>
  );
}

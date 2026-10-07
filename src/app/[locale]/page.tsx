import { useTranslations } from "next-intl";
import { AccountMenu } from "@/features/auth/account-menu";
import { MapView } from "@/features/map/map-view";

export default function HomePage() {
  const t = useTranslations("Home");

  return (
    <main className="relative flex-1">
      <MapView className="absolute inset-0" label={t("mapLabel")} />
      <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start gap-3">
        <header className="shadow-card border-line bg-cream/95 pointer-events-auto max-w-sm min-w-0 flex-1 rounded-2xl border px-4 py-3">
          <h1 className="font-display text-forest-dark text-2xl font-semibold">
            Kurious
          </h1>
          <p className="text-ink text-sm font-semibold">{t("tagline")}</p>
          <p className="text-muted text-sm">{t("intro")}</p>
        </header>
        <div className="pointer-events-auto ml-auto shrink-0">
          <AccountMenu />
        </div>
      </div>
    </main>
  );
}

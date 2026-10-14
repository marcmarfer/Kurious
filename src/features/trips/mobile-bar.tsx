import { getTranslations } from "next-intl/server";
import { TripNav } from "./trip-nav";

export async function MobileBar({ tripId }: { tripId?: string }) {
  const t = await getTranslations("Nav");

  return (
    <nav
      aria-label={t("sections")}
      className="bg-cream border-line shrink-0 border-t pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <TripNav tripId={tripId} variant="bar" withTrips />
    </nav>
  );
}

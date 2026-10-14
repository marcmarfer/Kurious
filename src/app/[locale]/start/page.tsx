import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AccountAvatarLink } from "@/features/auth/account-avatar";
import { TripMap } from "@/features/map/trip-map";
import { requireNoTrip } from "@/features/trips/no-trip";
import { NoTripCard } from "@/features/trips/no-trip-card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Nav");
  return { title: t("map") };
}

export default async function NoTripMapPage() {
  await requireNoTrip("");
  const t = await getTranslations("NoTrip");

  return (
    <div className="absolute inset-0">
      <TripMap
        stages={[]}
        ideas={[]}
        className="absolute inset-0"
        label={t("mapLabel")}
      />
      <AccountAvatarLink className="absolute top-[calc(env(safe-area-inset-top)+16px)] right-4" />
      <NoTripCard
        tab="map"
        className="absolute inset-x-4 bottom-6 mx-auto max-w-md lg:right-auto lg:bottom-8 lg:left-8 lg:mx-0"
      />
    </div>
  );
}

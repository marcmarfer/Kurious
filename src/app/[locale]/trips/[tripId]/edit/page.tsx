import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons";
import { CardHeading } from "@/features/auth/auth-card";
import { getTrip } from "@/features/trips/queries";
import { DeleteTripSection } from "@/features/trips/removal-buttons";
import { TripForm } from "@/features/trips/trip-form";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("EditTrip");
  return { title: t("metaTitle") };
}

export default async function EditTripPage({
  params,
}: PageProps<"/[locale]/trips/[tripId]/edit">) {
  const { tripId } = await params;
  const trip = await getTrip(tripId);
  if (!trip || trip.myRole === "guest") notFound();
  const t = await getTranslations("EditTrip");

  return (
    <div className="bg-paper flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 pt-8 pb-10 lg:pt-12">
      <div className="flex w-full max-w-[420px] flex-col gap-4">
        <Link
          href="/trips"
          className="text-forest-dark focus-ring flex items-center gap-1 self-start rounded-md font-bold"
        >
          <ChevronLeftIcon className="size-5" />
          {t("back")}
        </Link>
        <section className="border-line bg-cream shadow-card w-full rounded-[28px] border p-5 sm:p-7">
          <CardHeading title={t("title")} subtitle={t("subtitle")} />
          <TripForm
            trip={{
              id: trip.id,
              name: trip.name,
              startsOn: trip.startsOn,
              endsOn: trip.endsOn,
            }}
          />
        </section>
        {trip.myRole === "owner" && (
          <DeleteTripSection tripId={trip.id} tripName={trip.name} />
        )}
      </div>
    </div>
  );
}

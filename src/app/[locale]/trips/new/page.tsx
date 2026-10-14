import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Araucaria } from "@/components/araucaria";
import { MapPaper } from "@/components/map-paper";
import { AccountMenu } from "@/features/auth/account-menu";
import { CardFooter, CardHeading } from "@/features/auth/auth-card";
import { getCurrentUser } from "@/features/auth/session";
import { TripForm } from "@/features/trips/trip-form";
import { getMyTrips } from "@/features/trips/queries";
import { Link, redirect } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("NewTrip");
  return { title: t("metaTitle") };
}

export default async function NewTripPage() {
  if (!(await getCurrentUser())) {
    redirect({
      href: `/login?next=${encodeURIComponent("/trips/new")}`,
      locale: await getLocale(),
    });
  }
  const [t, trips] = await Promise.all([
    getTranslations("NewTrip"),
    getMyTrips(),
  ]);

  return (
    <main className="relative isolate flex min-h-dvh flex-1 flex-col items-center overflow-hidden px-4 pt-8 pb-10 sm:justify-center">
      <MapPaper className="absolute inset-0 -z-10 h-full w-full" />
      <div className="absolute top-4 right-4">
        <AccountMenu />
      </div>
      <div className="flex w-full max-w-[420px] flex-col items-center">
        <div className="flex flex-col items-center px-4 pb-5 text-center">
          <Araucaria className="h-28 w-21 sm:h-32 sm:w-24" />
          <span className="font-display text-forest-dark mt-1 text-[2.5rem] leading-none font-semibold">
            Kurious
          </span>
        </div>
        <section className="border-line bg-cream shadow-card w-full rounded-[28px] border p-5 sm:p-7">
          <CardHeading title={t("title")} subtitle={t("subtitle")} />
          <TripForm />
          <CardFooter>
            <Link
              href="/trips"
              className="text-forest-dark font-bold underline decoration-2 underline-offset-4"
            >
              {t(trips.length > 0 ? "allTrips" : "skip")}
            </Link>
          </CardFooter>
        </section>
      </div>
    </main>
  );
}

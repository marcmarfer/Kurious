import type { Metadata } from "next";
import { getLocale, getNow, getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { PlusIcon } from "@/components/icons";
import { AccountAvatarLink } from "@/features/auth/account-avatar";
import { getCurrentUser } from "@/features/auth/session";
import {
  CURRENT_TRIP_COOKIE,
  pickCurrentTrip,
} from "@/features/trips/current-trip";
import { getMyTrips } from "@/features/trips/queries";
import { MobileBar } from "@/features/trips/mobile-bar";
import { TripShell } from "@/features/trips/trip-shell";
import { TripCard } from "@/features/trips/trip-card";
import { splitTrips } from "@/features/trips/trip-status";
import { Link, redirect } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Trips");
  return { title: t("metaTitle") };
}

export default async function TripsPage({
  searchParams,
}: PageProps<"/[locale]/trips">) {
  const { invite } = await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    return redirect({
      href: `/login?next=${encodeURIComponent("/trips")}`,
      locale: await getLocale(),
    });
  }
  const [t, trips, now] = await Promise.all([
    getTranslations("Trips"),
    getMyTrips(),
    getNow(),
  ]);
  const { active, done } = splitTrips(trips, now);
  const latestId = pickCurrentTrip(
    trips,
    (await cookies()).get(CURRENT_TRIP_COOKIE)?.value,
    active[0] ?? done[0],
  )?.id;

  return (
    <TripShell user={user} tripId={latestId}>
      <div className="bg-paper min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-8 pb-10 lg:px-10 lg:pt-12">
          <header className="flex items-start gap-3">
            <div className="flex min-w-0 grow flex-col gap-1">
              <span className="text-pinhao text-xs font-bold">Kurious</span>
              <h1 className="font-display text-ink text-[28px] leading-tight font-semibold">
                {t("title")}
              </h1>
              <p className="text-muted text-sm">{t("subtitle")}</p>
            </div>
            <AccountAvatarLink />
          </header>
          {invite === "invalid" && (
            <p
              role="alert"
              className="bg-danger-soft text-danger rounded-xl px-3.5 py-2.5 text-sm font-bold"
            >
              {t("inviteInvalid")}
            </p>
          )}
          <Link
            href="/trips/new"
            className="focus-ring bg-pinhao text-cream flex h-12 items-center gap-2 self-start rounded-[15px] px-5 text-[15px] font-extrabold shadow-[0_2px_4px_rgba(94,44,22,.18),0_8px_18px_rgba(142,74,42,.28)] transition-[filter] hover:brightness-110"
          >
            <PlusIcon strokeWidth={2.4} />
            {t("new")}
          </Link>

          <section
            aria-labelledby="trips-active"
            className="flex flex-col gap-3"
          >
            <h2 id="trips-active" className="text-pinhao text-sm font-bold">
              {t("active")}
            </h2>
            {active.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {active.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    editable
                    current={trip.id === latestId}
                  />
                ))}
              </ul>
            ) : (
              <p className="border-line bg-cream/80 text-muted rounded-[22px] border border-dashed px-5 py-6 text-center">
                {t("emptyActive")}
              </p>
            )}
          </section>

          {done.length > 0 && (
            <section
              aria-labelledby="trips-done"
              className="flex flex-col gap-3"
            >
              <h2 id="trips-done" className="text-muted text-sm font-bold">
                {t("done")}
              </h2>
              <ul className="flex flex-col gap-3">
                {done.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    editable={false}
                    current={trip.id === latestId}
                  />
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
      <MobileBar tripId={latestId} />
    </TripShell>
  );
}

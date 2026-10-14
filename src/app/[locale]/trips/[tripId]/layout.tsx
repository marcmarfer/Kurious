import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/features/auth/session";
import {
  REQUEST_PATH_HEADER,
  tripReturnPath,
} from "@/features/auth/validation";
import { getTrip } from "@/features/trips/queries";
import { TripLive } from "@/features/trips/trip-live";
import { TripShell } from "@/features/trips/trip-shell";
import { redirect } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/trips/[tripId]">): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await getTrip(tripId);
  return trip ? { title: trip.name } : {};
}

export default async function TripLayout({
  children,
  params,
}: LayoutProps<"/[locale]/trips/[tripId]">) {
  const { tripId } = await params;
  const user = await getCurrentUser();
  if (!user) {
    const requestPath = (await headers()).get(REQUEST_PATH_HEADER);
    const next = tripReturnPath(requestPath, tripId);
    return redirect({
      href: `/login?next=${encodeURIComponent(next)}`,
      locale: await getLocale(),
    });
  }

  const trip = await getTrip(tripId);
  if (!trip) notFound();

  return (
    <TripShell tripId={trip.id} user={user}>
      <TripLive tripId={trip.id} />
      {children}
    </TripShell>
  );
}

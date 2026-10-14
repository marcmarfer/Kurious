import { getLocale } from "next-intl/server";
import { getCurrentUser } from "@/features/auth/session";
import { MobileBar } from "@/features/trips/mobile-bar";
import { NO_TRIP_PATH } from "@/features/trips/no-trip";
import { TripShell } from "@/features/trips/trip-shell";
import { redirect } from "@/i18n/navigation";

export default async function NoTripLayout({
  children,
}: LayoutProps<"/[locale]/start">) {
  const user = await getCurrentUser();
  if (!user)
    return redirect({
      href: `/login?next=${encodeURIComponent(NO_TRIP_PATH)}`,
      locale: await getLocale(),
    });

  return (
    <TripShell user={user}>
      <div className="relative min-h-0 flex-1 overflow-y-auto">{children}</div>
      <MobileBar />
    </TripShell>
  );
}

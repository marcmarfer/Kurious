import "server-only";
import { getLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { getCurrentUser, type CurrentUser } from "@/features/auth/session";
import { redirect } from "@/i18n/navigation";
import { CURRENT_TRIP_COOKIE, pickCurrentTrip } from "./current-trip";
import { getMyTrips } from "./queries";

export const NO_TRIP_PATH = "/start";

export async function requireNoTrip(tab: string): Promise<CurrentUser> {
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user)
    return redirect({
      href: `/login?next=${encodeURIComponent(NO_TRIP_PATH + tab)}`,
      locale,
    });

  const trips = await getMyTrips();
  const current = pickCurrentTrip(
    trips,
    (await cookies()).get(CURRENT_TRIP_COOKIE)?.value,
    trips[0],
  );
  if (current) return redirect({ href: `/trips/${current.id}${tab}`, locale });
  return user;
}

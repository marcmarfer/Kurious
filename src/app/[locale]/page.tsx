import { getLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { redirect as joinRedirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/session";
import { INVITE_COOKIE, invitePath } from "@/features/trips/invites";
import { getMyTrips } from "@/features/trips/queries";
import { isUuid } from "@/features/trips/validation";
import { redirect } from "@/i18n/navigation";

export default async function HomePage() {
  const locale = await getLocale();
  if (!(await getCurrentUser())) return redirect({ href: "/login", locale });

  const invite = (await cookies()).get(INVITE_COOKIE)?.value;
  if (isUuid(invite)) joinRedirect(invitePath(invite));
  const trips = await getMyTrips();
  return redirect({
    href:
      trips.length === 0
        ? "/start"
        : trips.length === 1
          ? `/trips/${trips[0].id}`
          : "/trips",
    locale,
  });
}

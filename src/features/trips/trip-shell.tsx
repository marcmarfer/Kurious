import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Avatar, type AvatarColor } from "@/components/avatar";
import { AppIcon } from "@/components/growth-icon";
import { AccountNameProvider } from "@/features/auth/account-avatar";
import type { CurrentUser } from "@/features/auth/session";
import { getMyProfile } from "@/features/profile/queries";
import { Link } from "@/i18n/navigation";
import { RailFrame, TripNav, TripsLink } from "./trip-nav";

export async function TripShell({
  tripId,
  user,
  children,
}: {
  tripId?: string;
  user: CurrentUser;
  children: ReactNode;
}) {
  const t = await getTranslations("Nav");
  const profile = await getMyProfile();
  const color = profile?.color ?? null;

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <RailFrame tripId={tripId} label={t("sections")}>
        <Link
          href={tripId ? `/trips/${tripId}` : "/start"}
          aria-label={tripId ? t("backToMap") : t("trips")}
          className="focus-ring mb-4 ml-[5px] flex self-start rounded-xl"
        >
          <AppIcon className="size-9" px={36} />
        </Link>
        <TripNav tripId={tripId} variant="rail" />
        <TripsLink variant="rail" />
        <RailAccount user={user} color={color} />
      </RailFrame>
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <AccountNameProvider name={user.name || user.email} color={color}>
          {children}
        </AccountNameProvider>
      </main>
    </div>
  );
}

async function RailAccount({
  user,
  color,
}: {
  user: CurrentUser;
  color: AvatarColor | null;
}) {
  const t = await getTranslations("Nav");
  const shown = user.name || user.email;

  return (
    <Link
      href="/settings"
      aria-label={t("account", { name: shown })}
      className="focus-ring text-mist hover:bg-cream/8 hover:text-cream mt-auto flex h-14 items-center gap-3 rounded-xl px-2 text-sm font-bold transition-colors group-data-compact/rail:justify-center group-data-compact/rail:px-0"
    >
      <Avatar
        name={shown}
        color={color}
        className="border-cream size-10 shrink-0 border-2 text-[14px]"
      />
      <span className="truncate group-data-compact/rail:sr-only">{shown}</span>
    </Link>
  );
}

import type { Metadata } from "next";
import { getLocale, getNow, getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { BackButton } from "@/components/back-button";
import { signOut } from "@/features/auth/actions";
import { getCurrentUser } from "@/features/auth/session";
import { AvatarColorPicker } from "@/features/profile/avatar-color-picker";
import { NameEditor, TagsEditor } from "@/features/profile/profile-editors";
import { getMyProfile } from "@/features/profile/queries";
import { MobileBar } from "@/features/trips/mobile-bar";
import {
  CURRENT_TRIP_COOKIE,
  pickCurrentTrip,
} from "@/features/trips/current-trip";
import { getMyTrips } from "@/features/trips/queries";
import { DeleteAccountSection } from "@/features/trips/removal-buttons";
import { splitTrips } from "@/features/trips/trip-status";
import { TripShell } from "@/features/trips/trip-shell";
import { redirect } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Settings");
  return { title: t("metaTitle") };
}

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    return redirect({
      href: `/login?next=${encodeURIComponent("/settings")}`,
      locale: await getLocale(),
    });
  }
  const [t, trips, now, profile, locale] = await Promise.all([
    getTranslations("Settings"),
    getMyTrips(),
    getNow(),
    getMyProfile(),
    getLocale(),
  ]);
  const { active, done } = splitTrips(trips, now);
  const latestId = pickCurrentTrip(
    trips,
    (await cookies()).get(CURRENT_TRIP_COOKIE)?.value,
    active[0] ?? done[0],
  )?.id;
  const name = profile?.name || user.name;
  const shown = name || user.email;

  return (
    <TripShell user={user} tripId={latestId}>
      <div className="bg-paper min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-8 pb-10 lg:px-10 lg:pt-12">
          <header className="flex items-start gap-1">
            <BackButton
              label={t("back")}
              fallback={latestId ? `/trips/${latestId}` : "/trips"}
              className="-mt-1 -ml-3 shrink-0 lg:hidden"
            />
            <div className="flex min-w-0 grow flex-col gap-1">
              <span className="text-pinhao text-xs font-bold">Kurious</span>
              <h1 className="font-display text-ink text-[28px] leading-tight font-semibold">
                {t("title")}
              </h1>
            </div>
          </header>

          <section
            aria-labelledby="settings-profile"
            className="border-line bg-cream shadow-card flex flex-col gap-5 rounded-[22px] border p-5"
          >
            <NameEditor
              name={name}
              email={user.email}
              avatar={
                <AvatarColorPicker
                  name={shown}
                  color={profile?.color ?? null}
                />
              }
            />
            <div className="bg-line h-px" />
            <TagsEditor tags={profile?.tags ?? []} />
          </section>

          <form action={signOut}>
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="border-stone text-ink hover:border-forest-dark focus-ring h-12 w-full cursor-pointer rounded-[14px] border-[1.5px] bg-white px-4 font-extrabold"
            >
              {t("signOut")}
            </button>
          </form>

          <DeleteAccountSection email={user.email} />
        </div>
      </div>
      <MobileBar tripId={latestId} />
    </TripShell>
  );
}

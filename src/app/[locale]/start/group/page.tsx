import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Avatar } from "@/components/avatar";
import { AccountAvatarLink } from "@/features/auth/account-avatar";
import { getMyProfile } from "@/features/profile/queries";
import { TravelerTagChip } from "@/features/profile/traveler-tag-chip";
import { requireNoTrip } from "@/features/trips/no-trip";
import { NoTripCard } from "@/features/trips/no-trip-card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Group");
  return { title: t("title") };
}

export default async function NoTripGroupPage() {
  const user = await requireNoTrip("/group");
  const [t, profile] = await Promise.all([
    getTranslations("Group"),
    getMyProfile(),
  ]);
  const name = profile?.name || user.name || user.email;
  const tags = profile?.tags ?? [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-8 pb-10 lg:px-10 lg:pt-12">
      <header className="flex items-start gap-3">
        <div className="flex min-w-0 grow flex-col gap-1">
          <span className="text-pinhao text-xs font-bold">Kurious</span>
          <h1 className="font-display text-ink text-[28px] leading-tight font-semibold">
            {t("title")}
          </h1>
        </div>
        <AccountAvatarLink />
      </header>

      <ul className="bg-cream border-line flex flex-col rounded-[22px] border">
        <li className="flex items-center gap-3 px-4 py-3">
          <Avatar
            name={name}
            color={profile?.color ?? null}
            className="size-10 text-sm"
          />
          <span className="flex min-w-0 flex-col">
            <span className="text-ink flex items-center gap-2 truncate font-bold">
              {name}
              <span className="bg-forest-soft text-forest-dark inline-flex h-5 items-center rounded-full px-2 text-[11px] font-extrabold">
                <span className="leading-none [text-box:trim-both_cap_alphabetic]">
                  {t("you")}
                </span>
              </span>
            </span>
            {tags.length > 0 && (
              <span className="mt-1.5 flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <TravelerTagChip key={tag} tag={tag} size="sm" />
                ))}
              </span>
            )}
          </span>
        </li>
      </ul>

      <NoTripCard tab="group" />
    </div>
  );
}

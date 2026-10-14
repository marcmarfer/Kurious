import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { getCurrentUser } from "@/features/auth/session";
import { AccountAvatarLink } from "@/features/auth/account-avatar";
import { TravelerTagChip } from "@/features/profile/traveler-tag-chip";
import { InviteCard } from "@/features/trips/invite-card";
import { getInvite, getTrip } from "@/features/trips/queries";
import {
  LeaveTripButton,
  RemoveMemberButton,
} from "@/features/trips/removal-buttons";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Group");
  return { title: t("title") };
}

export default async function GroupPage({
  params,
}: PageProps<"/[locale]/trips/[tripId]/group">) {
  const { tripId } = await params;
  const [trip, user] = await Promise.all([getTrip(tripId), getCurrentUser()]);
  if (!trip || !user) notFound();
  const canInvite = trip.myRole !== "guest";
  const invite = canInvite ? await getInvite(trip.id) : null;

  const t = await getTranslations("Group");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-8 pb-10 lg:px-10 lg:pt-12">
      <header className="flex items-start gap-3">
        <div className="flex min-w-0 grow flex-col gap-1">
          <span className="text-pinhao text-xs font-bold">{trip.name}</span>
          <h1 className="font-display text-ink text-[28px] leading-tight font-semibold">
            {t("title")}
          </h1>
          <p className="text-muted text-sm">
            {t("summary", { count: trip.members.length, trip: trip.name })}
          </p>
        </div>
        <AccountAvatarLink />
      </header>

      {canInvite && (
        <InviteCard tripId={trip.id} tripName={trip.name} invite={invite} />
      )}

      <ul className="bg-cream border-line divide-line flex flex-col divide-y rounded-[22px] border">
        {trip.members.map((member) => (
          <li key={member.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar
              name={member.name}
              color={member.color}
              className="size-10 text-sm"
            />
            <span className="flex min-w-0 flex-col">
              <span className="text-ink flex items-center gap-2 truncate font-bold">
                {member.name}
                {member.id === user.id && (
                  <span className="bg-forest-soft text-forest-dark inline-flex h-5 items-center rounded-full px-2 text-[11px] font-extrabold">
                    <span className="leading-none [text-box:trim-both_cap_alphabetic]">
                      {t("you")}
                    </span>
                  </span>
                )}
              </span>
              <span className="text-muted text-[13px]">
                {t(`roles.${member.role}`)}
              </span>
              {member.tags.length > 0 && (
                <span className="mt-1.5 flex flex-wrap gap-1">
                  {member.tags.map((tag) => (
                    <TravelerTagChip key={tag} tag={tag} size="sm" />
                  ))}
                </span>
              )}
            </span>
            {trip.myRole === "owner" && member.id !== user.id && (
              <span className="ml-auto">
                <RemoveMemberButton
                  tripId={trip.id}
                  userId={member.id}
                  name={member.name}
                />
              </span>
            )}
          </li>
        ))}
      </ul>

      {trip.myRole !== "owner" && (
        <LeaveTripButton tripId={trip.id} tripName={trip.name} />
      )}
    </div>
  );
}

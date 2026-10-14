import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AccountAvatarLink } from "@/features/auth/account-avatar";
import { requireNoTrip } from "@/features/trips/no-trip";
import { NoTripCard } from "@/features/trips/no-trip-card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Plan");
  return { title: t("title") };
}

export default async function NoTripPlanPage() {
  await requireNoTrip("/plan");
  const t = await getTranslations("Plan");

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
      <NoTripCard tab="plan" />
    </div>
  );
}

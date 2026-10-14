import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { StageScreen } from "@/features/stages/stage-screen";
import { getTrip } from "@/features/trips/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Stages");
  return { title: t("newTitle") };
}

export default async function NewStagePage({
  params,
}: PageProps<"/[locale]/trips/[tripId]/stages/new">) {
  const { tripId } = await params;
  const trip = await getTrip(tripId);
  if (!trip || trip.myRole === "guest") notFound();

  return <StageScreen trip={trip} stage={null} />;
}

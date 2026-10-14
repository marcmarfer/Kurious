import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { StageScreen } from "@/features/stages/stage-screen";
import { getTrip } from "@/features/trips/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Stages");
  return { title: t("editTitle") };
}

export default async function EditStagePage({
  params,
}: PageProps<"/[locale]/trips/[tripId]/stages/[stageId]">) {
  const { tripId, stageId } = await params;
  const trip = await getTrip(tripId);
  if (!trip || trip.myRole === "guest") notFound();
  const stage = trip.stages.find((item) => item.id === stageId);
  if (!stage) notFound();

  return <StageScreen key={stage.id} trip={trip} stage={stage} />;
}

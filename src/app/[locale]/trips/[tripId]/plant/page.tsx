import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PlantScreen } from "@/features/plant/plant-screen";
import { isIdeaKind } from "@/features/trips/growth";
import { getTrip } from "@/features/trips/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Plant");
  return { title: t("title") };
}

export default async function PlantPage({
  params,
  searchParams,
}: PageProps<"/[locale]/trips/[tripId]/plant">) {
  const { tripId } = await params;
  const { stage, kind } = await searchParams;
  const trip = await getTrip(tripId);
  if (!trip) notFound();
  const initialStageId =
    trip.stages.find((item) => item.id === stage)?.id ?? null;

  return (
    <PlantScreen
      trip={trip}
      initialStageId={initialStageId}
      initialKind={isIdeaKind(kind) ? kind : "place"}
    />
  );
}

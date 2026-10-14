import { getNow } from "next-intl/server";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/features/auth/session";
import { MapScreen } from "@/features/map-screen/map-screen";
import { getTrip } from "@/features/trips/queries";
import { isUuid } from "@/features/trips/validation";

export default async function TripMapPage({
  params,
  searchParams,
}: PageProps<"/[locale]/trips/[tripId]">) {
  const { tripId } = await params;
  const { idea, deleted } = await searchParams;
  const [trip, user] = await Promise.all([getTrip(tripId), getCurrentUser()]);
  if (!trip || !user) notFound();
  const now = await getNow();

  return (
    <MapScreen
      trip={trip}
      requestedIdeaId={typeof idea === "string" ? idea : null}
      deletedIdeaId={
        typeof deleted === "string" && isUuid(deleted) ? deleted : null
      }
      now={now.getTime()}
      myId={user.id}
    />
  );
}

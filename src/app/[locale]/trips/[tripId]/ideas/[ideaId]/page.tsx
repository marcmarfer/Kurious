import type { Metadata } from "next";
import { getNow } from "next-intl/server";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/features/auth/session";
import { rivalScore } from "@/features/idea/idea-growth";
import { IdeaScreen } from "@/features/idea/idea-screen";
import { getIdea } from "@/features/trips/queries";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/trips/[tripId]/ideas/[ideaId]">): Promise<Metadata> {
  const { tripId, ideaId } = await params;
  const found = await getIdea(tripId, ideaId);
  return found ? { title: found.idea.title } : {};
}

export default async function IdeaPage({
  params,
}: PageProps<"/[locale]/trips/[tripId]/ideas/[ideaId]">) {
  const { tripId, ideaId } = await params;
  const [found, user] = await Promise.all([
    getIdea(tripId, ideaId),
    getCurrentUser(),
  ]);
  if (!found || !user) notFound();
  const { trip, idea, comments } = found;
  const now = await getNow();

  return (
    <IdeaScreen
      key={idea.id}
      trip={trip}
      idea={idea}
      comments={comments}
      rival={rivalScore(trip.ideas, idea.id)}
      now={now.getTime()}
      myId={user.id}
      canModerate={trip.myRole === "owner"}
      canDelete={trip.myRole !== "guest" || idea.authorId === user.id}
    />
  );
}

"use server";

import { hasLocale, type Locale } from "next-intl";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/session";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import type { ActionError } from "./actions";
import { isUuid } from "./validation";

export type RemovalResult = { error?: ActionError };

function safeLocale(value: string): Locale {
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}

function errorKey(error: { code?: string }): ActionError {
  return error.code === "42501" ? "forbidden" : "generic";
}

function revalidateTrip(tripId: string) {
  for (const locale of routing.locales)
    revalidatePath(`/${locale}/trips/${tripId}`, "layout");
}

function revalidateTrips() {
  for (const locale of routing.locales) revalidatePath(`/${locale}/trips`);
}

async function signedInClient() {
  if (!(await getCurrentUser())) return null;
  return createClient();
}

export async function deleteIdea(
  tripId: string,
  ideaId: string,
  locale: string,
): Promise<RemovalResult> {
  if (!isUuid(tripId) || !isUuid(ideaId)) return { error: "notFound" };
  const supabase = await signedInClient();
  if (!supabase) return { error: "signedOut" };

  const { error } = await supabase.rpc("delete_idea", { p_idea_id: ideaId });
  if (error) return { error: errorKey(error) };

  revalidateTrip(tripId);
  return redirect({
    href: `/trips/${tripId}?deleted=${ideaId}`,
    locale: safeLocale(locale),
  });
}

export async function restoreIdea(
  tripId: string,
  ideaId: string,
): Promise<RemovalResult> {
  if (!isUuid(tripId) || !isUuid(ideaId)) return { error: "notFound" };
  const supabase = await signedInClient();
  if (!supabase) return { error: "signedOut" };

  const { error } = await supabase.rpc("restore_idea", { p_idea_id: ideaId });
  if (error) return { error: errorKey(error) };

  revalidateTrip(tripId);
  return {};
}

export async function deleteComment(
  tripId: string,
  commentId: string,
): Promise<RemovalResult> {
  if (!isUuid(tripId) || !isUuid(commentId)) return { error: "notFound" };
  const supabase = await signedInClient();
  if (!supabase) return { error: "signedOut" };

  const { data, error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .select("id");
  if (error) return { error: errorKey(error) };
  if (data.length === 0) return { error: "forbidden" };

  revalidateTrip(tripId);
  return {};
}

export async function deleteTrip(
  tripId: string,
  locale: string,
): Promise<RemovalResult> {
  if (!isUuid(tripId)) return { error: "notFound" };
  const supabase = await signedInClient();
  if (!supabase) return { error: "signedOut" };

  const { data, error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId)
    .select("id");
  if (error) return { error: errorKey(error) };
  if (data.length === 0) return { error: "forbidden" };

  revalidateTrips();
  return redirect({ href: "/trips", locale: safeLocale(locale) });
}

export async function leaveTrip(
  tripId: string,
  locale: string,
): Promise<RemovalResult> {
  if (!isUuid(tripId)) return { error: "notFound" };
  const user = await getCurrentUser();
  if (!user) return { error: "signedOut" };
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trip_members")
    .delete()
    .eq("trip_id", tripId)
    .eq("user_id", user.id)
    .select("user_id");
  if (error) return { error: errorKey(error) };
  if (data.length === 0) return { error: "forbidden" };

  revalidateTrips();
  return redirect({ href: "/trips", locale: safeLocale(locale) });
}

export async function removeMember(
  tripId: string,
  userId: string,
): Promise<RemovalResult> {
  if (!isUuid(tripId) || !isUuid(userId)) return { error: "notFound" };
  const supabase = await signedInClient();
  if (!supabase) return { error: "signedOut" };

  const { data, error } = await supabase
    .from("trip_members")
    .delete()
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .select("user_id");
  if (error) return { error: errorKey(error) };
  if (data.length === 0) return { error: "forbidden" };

  revalidateTrip(tripId);
  return {};
}

export async function deleteAccount(locale: string): Promise<RemovalResult> {
  const supabase = await signedInClient();
  if (!supabase) return { error: "signedOut" };

  const { error } = await supabase.rpc("delete_my_account");
  if (error) return { error: errorKey(error) };

  await supabase.auth.signOut({ scope: "local" });
  return redirect({ href: "/", locale: safeLocale(locale) });
}

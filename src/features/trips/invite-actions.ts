"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/session";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import type { ActionError } from "./actions";
import { isUuid } from "./validation";

export type InviteResult = { error?: ActionError };

function revalidateGroup(tripId: string) {
  for (const locale of routing.locales)
    revalidatePath(`/${locale}/trips/${tripId}/group`);
}

export async function createInvite(tripId: string): Promise<InviteResult> {
  if (!isUuid(tripId)) return { error: "notFound" };
  const user = await getCurrentUser();
  if (!user) return { error: "signedOut" };
  const supabase = await createClient();

  const removed = await supabase
    .from("trip_invites")
    .delete()
    .eq("trip_id", tripId);
  if (removed.error) return { error: "generic" };

  const { error } = await supabase
    .from("trip_invites")
    .insert({ trip_id: tripId, created_by: user.id });
  if (error) return { error: error.code === "42501" ? "forbidden" : "generic" };

  revalidateGroup(tripId);
  return {};
}

export async function revokeInvite(tripId: string): Promise<InviteResult> {
  if (!isUuid(tripId)) return { error: "notFound" };
  if (!(await getCurrentUser())) return { error: "signedOut" };
  const supabase = await createClient();

  const { error } = await supabase
    .from("trip_invites")
    .delete()
    .eq("trip_id", tripId);
  if (error) return { error: "generic" };

  revalidateGroup(tripId);
  return {};
}

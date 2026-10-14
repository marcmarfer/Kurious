"use server";

import { revalidatePath } from "next/cache";
import { isAvatarColor } from "@/components/avatar";
import { getCurrentUser } from "@/features/auth/session";
import type { ActionError } from "@/features/trips/actions";
import { createClient } from "@/lib/supabase/server";
import {
  parseProfileName,
  parseTravelerTags,
  type ProfileFieldError,
} from "./traveler-tags";

export type ProfileFormState = {
  status: "idle" | "saved" | "error";
  error?: ActionError;
  nameError?: ProfileFieldError;
  savedAt?: number;
};

export async function updateName(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const name = parseProfileName(String(formData.get("name") ?? ""));
  if (!name.ok) return { status: "error", nameError: name.error };
  const user = await getCurrentUser();
  if (!user) return { status: "error", error: "signedOut" };
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ name: name.value })
    .eq("id", user.id);
  if (error) return { status: "error", error: "generic" };

  if (name.value !== user.name) {
    const { error: authError } = await supabase.auth.updateUser({
      data: { name: name.value },
    });
    if (authError) return { status: "error", error: "generic" };
  }

  revalidatePath("/", "layout");
  return { status: "saved", savedAt: Date.now() };
}

export async function updateTravelerTags(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const tags = parseTravelerTags(formData.getAll("tags"));
  const user = await getCurrentUser();
  if (!user) return { status: "error", error: "signedOut" };
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ traveler_tags: tags })
    .eq("id", user.id);
  if (error) return { status: "error", error: "generic" };

  revalidatePath("/", "layout");
  return { status: "saved", savedAt: Date.now() };
}

export async function updateAvatarColor(
  color: string | null,
): Promise<{ error?: ActionError }> {
  if (color !== null && !isAvatarColor(color)) return { error: "generic" };
  const user = await getCurrentUser();
  if (!user) return { error: "signedOut" };
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_color: color })
    .eq("id", user.id);
  if (error) return { error: "generic" };

  revalidatePath("/", "layout");
  return {};
}

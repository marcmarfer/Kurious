"use server";

import { hasLocale } from "next-intl";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/session";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import type { ActionError } from "./actions";
import {
  isUuid,
  parseStage,
  type StageFieldError,
  type StageFields,
} from "./validation";

export type StageFormState = {
  status: "idle" | "error";
  error?: ActionError;
  fieldErrors?: Partial<Record<StageFields, StageFieldError>>;
};

export type StageResult = { error?: ActionError };

const text = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "");

function formLocale(value: unknown) {
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}

function errorKey(error: { code?: string }): ActionError {
  if (error.code === "42501") return "forbidden";
  if (error.code === "23503") return "notFound";
  return "generic";
}

function revalidateTrip(tripId: string) {
  for (const locale of routing.locales)
    revalidatePath(`/${locale}/trips/${tripId}`, "layout");
}

export async function saveStage(
  tripId: string,
  stageId: string | null,
  _prev: StageFormState,
  formData: FormData,
): Promise<StageFormState> {
  if (!isUuid(tripId) || (stageId !== null && !isUuid(stageId)))
    return { status: "error", error: "notFound" };
  const parsed = parseStage({
    name: text(formData, "name"),
    startsOn: text(formData, "startsOn"),
    endsOn: text(formData, "endsOn"),
    lon: text(formData, "lon"),
    lat: text(formData, "lat"),
    color: text(formData, "color"),
  });
  if (!parsed.ok) return { status: "error", fieldErrors: parsed.errors };
  if (!(await getCurrentUser())) return { status: "error", error: "signedOut" };

  const stage = parsed.value;
  const supabase = await createClient();
  if (stageId === null) {
    const { data, error } = await supabase.rpc("add_stage", {
      p_trip_id: tripId,
      p_name: stage.name,
      p_starts_on: stage.startsOn ?? undefined,
      p_ends_on: stage.endsOn ?? undefined,
      p_lon: stage.lon ?? undefined,
      p_lat: stage.lat ?? undefined,
    });
    if (error || !data)
      return { status: "error", error: error ? errorKey(error) : "generic" };
    if (stage.color)
      await supabase
        .from("stages")
        .update({ color: stage.color })
        .eq("id", data)
        .eq("trip_id", tripId);
  } else {
    const { data, error } = await supabase
      .from("stages")
      .update({
        name: stage.name,
        starts_on: stage.startsOn,
        ends_on: stage.endsOn,
        color: stage.color,
        geom:
          stage.lon !== null && stage.lat !== null
            ? `SRID=4326;POINT(${stage.lon} ${stage.lat})`
            : null,
      })
      .eq("id", stageId)
      .eq("trip_id", tripId)
      .select("id");
    if (error) return { status: "error", error: errorKey(error) };
    if (data.length === 0) return { status: "error", error: "forbidden" };
  }

  revalidateTrip(tripId);
  return redirect({
    href: `/trips/${tripId}/plan`,
    locale: formLocale(formData.get("locale")),
  });
}

export type QuickStageResult =
  { id: string } | { error: ActionError } | { fieldError: StageFieldError };

export async function quickAddStage(
  tripId: string,
  name: string,
  point: [number, number] | null,
  color: string,
): Promise<QuickStageResult> {
  if (!isUuid(tripId)) return { error: "notFound" };
  const parsed = parseStage({
    name,
    startsOn: "",
    endsOn: "",
    lon: point ? String(point[0]) : "",
    lat: point ? String(point[1]) : "",
    color,
  });
  if (!parsed.ok)
    return {
      fieldError: parsed.errors.name ?? "placeInvalid",
    };
  if (!(await getCurrentUser())) return { error: "signedOut" };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("add_stage", {
    p_trip_id: tripId,
    p_name: parsed.value.name,
    p_lon: parsed.value.lon ?? undefined,
    p_lat: parsed.value.lat ?? undefined,
  });
  if (error || !data) return { error: error ? errorKey(error) : "generic" };
  if (parsed.value.color)
    await supabase
      .from("stages")
      .update({ color: parsed.value.color })
      .eq("id", data)
      .eq("trip_id", tripId);

  revalidateTrip(tripId);
  return { id: data };
}

export async function deleteStage(
  tripId: string,
  stageId: string,
  locale: string,
): Promise<StageResult> {
  if (!isUuid(tripId) || !isUuid(stageId)) return { error: "notFound" };
  if (!(await getCurrentUser())) return { error: "signedOut" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stages")
    .delete()
    .eq("id", stageId)
    .eq("trip_id", tripId)
    .select("id");
  if (error) return { error: errorKey(error) };
  if (data.length === 0) return { error: "forbidden" };

  revalidateTrip(tripId);
  return redirect({
    href: `/trips/${tripId}/plan`,
    locale: formLocale(locale),
  });
}

export async function moveStage(
  tripId: string,
  stageId: string,
  up: boolean,
): Promise<StageResult> {
  if (!isUuid(tripId) || !isUuid(stageId)) return { error: "notFound" };
  if (!(await getCurrentUser())) return { error: "signedOut" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("move_stage", {
    p_stage_id: stageId,
    p_up: up,
  });
  if (error) return { error: errorKey(error) };

  revalidateTrip(tripId);
  return {};
}

export async function assignIdeas(
  tripId: string,
  stageId: string,
  ideaIds: string[],
): Promise<StageResult> {
  if (!isUuid(tripId) || !isUuid(stageId) || !ideaIds.every(isUuid))
    return { error: "notFound" };
  if (ideaIds.length === 0) return {};
  if (!(await getCurrentUser())) return { error: "signedOut" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("ideas")
    .update({ stage_id: stageId })
    .eq("trip_id", tripId)
    .in("id", ideaIds);
  if (error) return { error: errorKey(error) };

  revalidateTrip(tripId);
  return {};
}

export async function reorderStages(
  tripId: string,
  stageIds: string[],
): Promise<StageResult> {
  if (!isUuid(tripId) || !stageIds.every(isUuid)) return { error: "notFound" };
  if (!(await getCurrentUser())) return { error: "signedOut" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("reorder_stages", {
    p_trip_id: tripId,
    p_stage_ids: stageIds,
  });
  if (error) return { error: errorKey(error) };

  revalidateTrip(tripId);
  return {};
}

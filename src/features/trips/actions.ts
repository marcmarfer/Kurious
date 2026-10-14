"use server";

import { hasLocale } from "next-intl";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/features/auth/session";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { isVoteValue } from "./growth";
import type { VoteValue } from "./types";
import {
  isMapPoint,
  isUuid,
  parseComment,
  parseIdea,
  parseIdeaEdit,
  parseTrip,
  type CommentFieldError,
  type IdeaEditError,
  type IdeaFieldError,
  type IdeaFields,
  type TripFieldError,
  type TripFields,
} from "./validation";

export type ActionError = "signedOut" | "forbidden" | "notFound" | "generic";

export type VoteResult = { myVote: VoteValue | null } | { error: ActionError };

export type MoveResult = { ok: true } | { error: ActionError };

export type CommentFormState = {
  status: "idle" | "ok" | "error";
  error?: ActionError | CommentFieldError;
  body?: string;
  sentAt?: number;
};

type IdeaValues = Partial<
  Record<
    "kind" | "title" | "note" | "sourceUrl" | "stageId" | "lon" | "lat",
    string
  >
>;

export type PlantFormState = {
  status: "idle" | "error";
  error?: ActionError;
  fieldErrors?: Partial<Record<IdeaFields, IdeaFieldError>>;
  values?: IdeaValues;
};

export type IdeaEditState = {
  status: "idle" | "saved" | "error";
  error?: ActionError;
  fieldErrors?: Partial<Record<"title" | "note", IdeaEditError>>;
  savedAt?: number;
};

export type TripFormState = {
  status: "idle" | "error";
  error?: ActionError;
  fieldErrors?: Partial<Record<TripFields, TripFieldError>>;
  values?: { name?: string; startsOn?: string; endsOn?: string };
};

const text = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "");

function formLocale(formData: FormData) {
  const value = formData.get("locale");
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

function revalidateTrips() {
  for (const locale of routing.locales) revalidatePath(`/${locale}/trips`);
}

export async function castVote(
  tripId: string,
  ideaId: string,
  value: VoteValue,
): Promise<VoteResult> {
  if (!isUuid(tripId) || !isUuid(ideaId) || !isVoteValue(value))
    return { error: "notFound" };
  if (!(await getCurrentUser())) return { error: "signedOut" };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("cast_vote", {
    p_idea_id: ideaId,
    p_value: value,
  });
  if (error) return { error: errorKey(error) };

  revalidateTrip(tripId);
  return { myVote: isVoteValue(data) ? data : null };
}

export async function addComment(
  _prev: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const tripId = text(formData, "tripId");
  const ideaId = text(formData, "ideaId");
  const raw = text(formData, "body");

  if (!isUuid(tripId) || !isUuid(ideaId))
    return { status: "error", error: "notFound", body: raw };
  const parsed = parseComment(raw);
  if (!parsed.ok)
    return { status: "error", error: parsed.errors.body, body: raw };
  if (!(await getCurrentUser()))
    return { status: "error", error: "signedOut", body: raw };

  const supabase = await createClient();
  const { error } = await supabase
    .from("comments")
    .insert({ idea_id: ideaId, body: parsed.value });
  if (error) return { status: "error", error: errorKey(error), body: raw };

  revalidateTrip(tripId);
  return { status: "ok", sentAt: Date.now() };
}

export async function plantIdea(
  _prev: PlantFormState,
  formData: FormData,
): Promise<PlantFormState> {
  const tripId = text(formData, "tripId");
  const values = {
    kind: text(formData, "kind"),
    title: text(formData, "title"),
    note: text(formData, "note"),
    sourceUrl: text(formData, "sourceUrl"),
    stageId: text(formData, "stageId"),
    lon: text(formData, "lon"),
    lat: text(formData, "lat"),
  };

  if (!isUuid(tripId)) return { status: "error", error: "notFound", values };
  const parsed = parseIdea(values);
  if (!parsed.ok)
    return { status: "error", fieldErrors: parsed.errors, values };
  if (!(await getCurrentUser()))
    return { status: "error", error: "signedOut", values };

  const idea = parsed.value;
  const supabase = await createClient();
  const { data: ideaId, error } = await supabase.rpc("plant_idea", {
    p_trip_id: tripId,
    p_kind: idea.kind,
    p_title: idea.title,
    p_note: idea.note ?? undefined,
    p_source_url: idea.sourceUrl ?? undefined,
    p_stage_id: idea.stageId ?? undefined,
    p_lon: idea.lon ?? undefined,
    p_lat: idea.lat ?? undefined,
  });
  if (error || !ideaId)
    return {
      status: "error",
      error: error ? errorKey(error) : "generic",
      values,
    };

  revalidateTrip(tripId);
  return redirect({
    href: `/trips/${tripId}?idea=${ideaId}`,
    locale: formLocale(formData),
  });
}

export async function createTrip(
  _prev: TripFormState,
  formData: FormData,
): Promise<TripFormState> {
  const values = {
    name: text(formData, "name"),
    startsOn: text(formData, "startsOn"),
    endsOn: text(formData, "endsOn"),
  };

  const parsed = parseTrip(values);
  if (!parsed.ok)
    return { status: "error", fieldErrors: parsed.errors, values };
  if (!(await getCurrentUser()))
    return { status: "error", error: "signedOut", values };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .insert({
      name: parsed.value.name,
      starts_on: parsed.value.startsOn,
      ends_on: parsed.value.endsOn,
    })
    .select("id")
    .single();
  if (error) return { status: "error", error: errorKey(error), values };

  revalidateTrips();
  return redirect({
    href: `/trips/${data.id}`,
    locale: formLocale(formData),
  });
}

export async function updateTrip(
  tripId: string,
  _prev: TripFormState,
  formData: FormData,
): Promise<TripFormState> {
  const values = {
    name: text(formData, "name"),
    startsOn: text(formData, "startsOn"),
    endsOn: text(formData, "endsOn"),
  };

  if (!isUuid(tripId)) return { status: "error", error: "notFound", values };
  const parsed = parseTrip(values);
  if (!parsed.ok)
    return { status: "error", fieldErrors: parsed.errors, values };
  if (!(await getCurrentUser()))
    return { status: "error", error: "signedOut", values };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .update({
      name: parsed.value.name,
      starts_on: parsed.value.startsOn,
      ends_on: parsed.value.endsOn,
    })
    .eq("id", tripId)
    .select("id");
  if (error) return { status: "error", error: errorKey(error), values };
  if (data.length === 0) return { status: "error", error: "forbidden", values };

  revalidateTrip(tripId);
  revalidateTrips();
  return redirect({ href: "/trips", locale: formLocale(formData) });
}

export async function updateIdea(
  tripId: string,
  ideaId: string,
  _prev: IdeaEditState,
  formData: FormData,
): Promise<IdeaEditState> {
  if (!isUuid(tripId) || !isUuid(ideaId))
    return { status: "error", error: "notFound" };
  const parsed = parseIdeaEdit({
    title: text(formData, "title"),
    note: text(formData, "note"),
  });
  if (!parsed.ok) return { status: "error", fieldErrors: parsed.errors };
  const stageId = formData.has("stageId") ? text(formData, "stageId") : null;
  if (stageId && !isUuid(stageId))
    return { status: "error", error: "notFound" };
  if (!(await getCurrentUser())) return { status: "error", error: "signedOut" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .update({
      title: parsed.value.title,
      note: parsed.value.note,
      ...(stageId === null ? {} : { stage_id: stageId || null }),
    })
    .eq("id", ideaId)
    .select("id");
  if (error) return { status: "error", error: errorKey(error) };
  if (data.length === 0) return { status: "error", error: "forbidden" };

  revalidateTrip(tripId);
  return { status: "saved", savedAt: Date.now() };
}

export async function moveIdea(
  tripId: string,
  ideaId: string,
  lon: number | null,
  lat: number | null,
): Promise<MoveResult> {
  const cleared = lon === null && lat === null;
  if (!isUuid(tripId) || !isUuid(ideaId) || !(cleared || isMapPoint(lon, lat)))
    return { error: "notFound" };
  if (!(await getCurrentUser())) return { error: "signedOut" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .update({ geom: cleared ? null : `SRID=4326;POINT(${lon} ${lat})` })
    .eq("id", ideaId)
    .select("id");
  if (error) return { error: errorKey(error) };
  if (data.length === 0) return { error: "forbidden" };

  revalidateTrip(tripId);
  return { ok: true };
}

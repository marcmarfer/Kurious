import { isAvatarColor } from "@/components/avatar";
import { parseTravelerTags } from "@/features/profile/traveler-tags";
import type { Database } from "@/lib/supabase/database.types";
import { isGrowth, isIdeaKind, isVoteValue } from "./growth";
import type {
  Comment,
  Geometry,
  Idea,
  Member,
  Role,
  Stage,
  TripSummary,
} from "./types";
import { isStageColor } from "./stage-colors";

type Views = Database["public"]["Views"];
type Tables = Database["public"]["Tables"];

export type IdeaRow = Views["trip_ideas"]["Row"];
export type StageRow = Views["trip_stages"]["Row"];
export type CommentRow = Pick<
  Tables["comments"]["Row"],
  "id" | "idea_id" | "author_id" | "body" | "created_at"
>;
export type TripRow = Pick<
  Tables["trips"]["Row"],
  "id" | "name" | "starts_on" | "ends_on"
>;
export type MemberRow = { user_id: string; role: string };
export type ProfileRow = Pick<
  Tables["profiles"]["Row"],
  "id" | "name" | "avatar_url"
> & { traveler_tags?: string[]; avatar_color?: string | null };

const ROLES: readonly Role[] = ["owner", "editor", "guest"];

export function toRole(value: unknown): Role {
  return ROLES.includes(value as Role) ? (value as Role) : "guest";
}

export function toTripSummary(row: TripRow): TripSummary {
  return {
    id: row.id,
    name: row.name,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
  };
}

export function toMembers(
  members: readonly MemberRow[],
  profiles: readonly ProfileRow[],
): Member[] {
  const byId = new Map(profiles.map((profile) => [profile.id, profile]));
  const order = (role: Role) => ROLES.indexOf(role);
  return members
    .map((member) => {
      const profile = byId.get(member.user_id);
      return {
        id: member.user_id,
        name: profile?.name ?? "",
        avatarUrl: profile?.avatar_url ?? null,
        role: toRole(member.role),
        tags: parseTravelerTags(profile?.traveler_tags ?? []),
        color: isAvatarColor(profile?.avatar_color)
          ? profile.avatar_color
          : null,
      };
    })
    .sort(
      (a, b) => order(a.role) - order(b.role) || a.name.localeCompare(b.name),
    );
}

export function toStage(row: StageRow): Stage | null {
  if (!row.id || row.position === null || !row.name) return null;
  return {
    id: row.id,
    position: row.position,
    name: row.name,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    lon: row.lon,
    lat: row.lat,
    color: isStageColor(row.color) ? row.color : null,
  };
}

export function toIdea(row: IdeaRow): Idea | null {
  if (!row.id || !row.trip_id || !row.title || !row.created_at) return null;
  return {
    id: row.id,
    tripId: row.trip_id,
    stageId: row.stage_id,
    kind: isIdeaKind(row.kind) ? row.kind : "random",
    title: row.title,
    note: row.note,
    sourceUrl: row.source_url,
    authorId: row.author_id,
    authorName: row.author_name ?? "",
    createdAt: row.created_at,
    fire: row.fire ?? 0,
    up: row.up ?? 0,
    down: row.down ?? 0,
    score: row.score ?? 0,
    growth: isGrowth(row.growth) ? row.growth : "seed",
    myVote: isVoteValue(row.my_vote) ? row.my_vote : null,
    commentCount: row.comment_count ?? 0,
    lon: row.lon,
    lat: row.lat,
    shape: toGeometry(row.shape),
    lengthM: row.length_m,
    members: row.members ?? 0,
  };
}

function toGeometry(value: unknown): Geometry | null {
  if (!value || typeof value !== "object") return null;
  const { type, coordinates } = value as {
    type?: unknown;
    coordinates?: unknown;
  };
  if (!Array.isArray(coordinates)) return null;
  if (type === "Point" || type === "LineString" || type === "Polygon")
    return { type, coordinates } as Geometry;
  return null;
}

export function toComment(
  row: CommentRow,
  names: ReadonlyMap<string, string>,
): Comment {
  return {
    id: row.id,
    ideaId: row.idea_id,
    authorId: row.author_id,
    authorName: (row.author_id && names.get(row.author_id)) || "",
    body: row.body,
    createdAt: row.created_at,
  };
}

export function present<T>(value: T | null): value is T {
  return value !== null;
}

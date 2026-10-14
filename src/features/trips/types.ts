import type { AvatarColor } from "@/components/avatar";
import type { TravelerTag } from "@/features/profile/traveler-tags";
import type { StageColor } from "./stage-colors";

export type IdeaKind = "place" | "route" | "food" | "random";

export type Growth = "seed" | "sprout" | "sapling" | "araucaria" | "fire";

export type VoteValue = "fire" | "up" | "down";

export type Role = "owner" | "editor" | "guest";

export type Geometry =
  | { type: "Point"; coordinates: [number, number] }
  | { type: "LineString"; coordinates: [number, number][] }
  | { type: "Polygon"; coordinates: [number, number][][] };

export type Member = {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: Role;
  tags: TravelerTag[];
  color: AvatarColor | null;
};

export type Stage = {
  id: string;
  position: number;
  name: string;
  startsOn: string | null;
  endsOn: string | null;
  lon: number | null;
  lat: number | null;
  color: StageColor | null;
};

export type Idea = {
  id: string;
  tripId: string;
  stageId: string | null;
  kind: IdeaKind;
  title: string;
  note: string | null;
  sourceUrl: string | null;
  authorId: string | null;
  authorName: string;
  createdAt: string;
  fire: number;
  up: number;
  down: number;
  score: number;
  growth: Growth;
  myVote: VoteValue | null;
  commentCount: number;
  lon: number | null;
  lat: number | null;
  shape: Geometry | null;
  lengthM: number | null;
  members: number;
};

export type Comment = {
  id: string;
  ideaId: string;
  authorId: string | null;
  authorName: string;
  body: string;
  createdAt: string;
};

export type TripSummary = {
  id: string;
  name: string;
  startsOn: string | null;
  endsOn: string | null;
};

export type Trip = TripSummary & {
  myRole: Role;
  members: Member[];
  stages: Stage[];
  ideas: Idea[];
};

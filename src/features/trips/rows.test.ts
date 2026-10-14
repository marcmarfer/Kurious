import { describe, expect, it } from "vitest";
import { toComment, toIdea, toMembers, toStage, type IdeaRow } from "./rows";

const row: IdeaRow = {
  id: "d0000000-0000-4000-8000-000000000001",
  trip_id: "b0000000-0000-4000-8000-000000000001",
  stage_id: "c0000000-0000-4000-8000-000000000004",
  kind: "route",
  title: "Tren Serra Verde, de Curitiba a Morretes",
  note: null,
  source_url: "https://www.serraverdeexpress.com.br",
  author_id: "a0000000-0000-4000-8000-000000000001",
  author_name: "Marc",
  created_at: "2026-10-08T09:00:00+00:00",
  fire: 4,
  up: 1,
  down: 0,
  score: 13,
  growth: "fire",
  my_vote: "fire",
  comment_count: 6,
  lon: -49.03,
  lat: -25.47,
  shape: {
    type: "LineString",
    coordinates: [
      [-49.25, -25.43],
      [-48.83, -25.47],
    ],
  },
  length_m: 67744,
  members: 4,
};

describe("toIdea", () => {
  it("maps a trip_ideas row to an idea", () => {
    expect(toIdea(row)).toEqual({
      id: row.id,
      tripId: row.trip_id,
      stageId: row.stage_id,
      kind: "route",
      title: row.title,
      note: null,
      sourceUrl: row.source_url,
      authorId: row.author_id,
      authorName: "Marc",
      createdAt: row.created_at,
      fire: 4,
      up: 1,
      down: 0,
      score: 13,
      growth: "fire",
      myVote: "fire",
      commentCount: 6,
      lon: -49.03,
      lat: -25.47,
      shape: row.shape,
      lengthM: 67744,
      members: 4,
    });
  });

  it("falls back to safe values for unknown or missing data", () => {
    const idea = toIdea({
      ...row,
      kind: "hotel",
      growth: null,
      my_vote: null,
      fire: null,
      author_name: null,
      shape: { type: "GeometryCollection", geometries: [] },
    });
    expect(idea).toMatchObject({
      kind: "random",
      growth: "seed",
      myVote: null,
      fire: 0,
      authorName: "",
      shape: null,
    });
    expect(toIdea({ ...row, id: null })).toBeNull();
  });
});

describe("toStage", () => {
  it("maps a trip_stages row", () => {
    expect(
      toStage({
        id: "c1",
        trip_id: "t",
        position: 1,
        name: "Rio",
        starts_on: "2027-01-12",
        ends_on: "2027-01-14",
        lon: -43.2,
        lat: -22.95,
        created_at: null,
        updated_at: null,
        color: "sky",
      }),
    ).toEqual({
      id: "c1",
      position: 1,
      name: "Rio",
      startsOn: "2027-01-12",
      endsOn: "2027-01-14",
      lon: -43.2,
      lat: -22.95,
      color: "sky",
    });
  });
});

describe("toMembers", () => {
  it("joins the profiles and lists the owner first", () => {
    const members = toMembers(
      [
        { user_id: "laura", role: "editor" },
        { user_id: "marc", role: "owner" },
        { user_id: "alex", role: "editor" },
        { user_id: "gone", role: "mystery" },
      ],
      [
        { id: "marc", name: "Marc", avatar_url: null },
        { id: "laura", name: "Laura", avatar_url: "https://x.test/l.png" },
        { id: "alex", name: "Álex", avatar_url: null },
      ],
    );
    expect(members.map((m) => [m.id, m.role, m.name])).toEqual([
      ["marc", "owner", "Marc"],
      ["alex", "editor", "Álex"],
      ["laura", "editor", "Laura"],
      ["gone", "guest", ""],
    ]);
    expect(members[2].avatarUrl).toBe("https://x.test/l.png");
  });
});

describe("toComment", () => {
  it("names the author from the trip members", () => {
    const names = new Map([["laura", "Laura"]]);
    const base = {
      id: "c",
      idea_id: "i",
      body: "Hola",
      created_at: "2026-10-08T10:00:00+00:00",
    };
    expect(toComment({ ...base, author_id: "laura" }, names).authorName).toBe(
      "Laura",
    );
    expect(toComment({ ...base, author_id: null }, names).authorName).toBe("");
  });
});

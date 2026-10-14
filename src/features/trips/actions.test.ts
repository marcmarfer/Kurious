import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: { id: "a0000000-0000-4000-8000-000000000001" } as object | null,
  rpc: vi.fn(),
  insert: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn((args: { href: string; locale: string }) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { args });
  }),
}));

vi.mock("@/features/auth/session", () => ({
  getCurrentUser: async () => mocks.user,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/i18n/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    rpc: mocks.rpc,
    from: () => ({
      insert: (row: object) => {
        const result = mocks.insert(row);
        return Object.assign(Promise.resolve(result), {
          select: () => ({ single: async () => result }),
        });
      },
    }),
  }),
}));

const { addComment, castVote, createTrip, plantIdea } =
  await import("./actions");

const TRIP = "b0000000-0000-4000-8000-000000000001";
const IDEA = "d0000000-0000-4000-8000-000000000001";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

beforeEach(() => {
  mocks.user = { id: "a0000000-0000-4000-8000-000000000001" };
  mocks.rpc.mockReset();
  mocks.insert.mockReset();
  mocks.revalidatePath.mockReset();
  mocks.redirect.mockClear();
});

describe("castVote", () => {
  it("returns the new vote and refreshes the trip in every language", async () => {
    mocks.rpc.mockResolvedValue({ data: "fire", error: null });

    await expect(castVote(TRIP, IDEA, "fire")).resolves.toEqual({
      myVote: "fire",
    });
    expect(mocks.rpc).toHaveBeenCalledWith("cast_vote", {
      p_idea_id: IDEA,
      p_value: "fire",
    });
    expect(mocks.revalidatePath.mock.calls).toEqual([
      [`/es/trips/${TRIP}`, "layout"],
      [`/pt/trips/${TRIP}`, "layout"],
      [`/en/trips/${TRIP}`, "layout"],
    ]);
  });

  it("reports a removed vote as null", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: null });
    await expect(castVote(TRIP, IDEA, "fire")).resolves.toEqual({
      myVote: null,
    });
  });

  it("explains why a vote could not be cast", async () => {
    await expect(castVote(TRIP, "tren", "fire")).resolves.toEqual({
      error: "notFound",
    });
    mocks.user = null;
    await expect(castVote(TRIP, IDEA, "up")).resolves.toEqual({
      error: "signedOut",
    });
    mocks.user = { id: "x" };
    mocks.rpc.mockResolvedValue({ data: null, error: { code: "42501" } });
    await expect(castVote(TRIP, IDEA, "up")).resolves.toEqual({
      error: "forbidden",
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});

describe("addComment", () => {
  it("saves the trimmed comment", async () => {
    mocks.insert.mockReturnValue({ error: null });

    const state = await addComment(
      { status: "idle" },
      form({ tripId: TRIP, ideaId: IDEA, body: "  ¡Vamos!  " }),
    );
    expect(state).toMatchObject({ status: "ok" });
    expect(mocks.insert).toHaveBeenCalledWith({
      idea_id: IDEA,
      body: "¡Vamos!",
    });
    expect(mocks.revalidatePath).toHaveBeenCalled();
  });

  it("keeps the text when it cannot be sent", async () => {
    const state = await addComment(
      { status: "idle" },
      form({ tripId: TRIP, ideaId: IDEA, body: "   " }),
    );
    expect(state).toEqual({
      status: "error",
      error: "bodyRequired",
      body: "   ",
    });
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});

describe("plantIdea", () => {
  const fields = {
    tripId: TRIP,
    locale: "pt",
    kind: "food",
    title: " Pastel de feira ",
    note: "",
    sourceUrl: "",
    stageId: "c0000000-0000-4000-8000-000000000004",
    lon: "-49.27",
    lat: "-25.43",
  };

  it("plants the idea and opens it on the trip map", async () => {
    mocks.rpc.mockResolvedValue({ data: "new-idea", error: null });

    await expect(plantIdea({ status: "idle" }, form(fields))).rejects.toThrow(
      "NEXT_REDIRECT",
    );
    expect(mocks.rpc).toHaveBeenCalledWith("plant_idea", {
      p_trip_id: TRIP,
      p_kind: "food",
      p_title: "Pastel de feira",
      p_note: undefined,
      p_source_url: undefined,
      p_stage_id: "c0000000-0000-4000-8000-000000000004",
      p_lon: -49.27,
      p_lat: -25.43,
    });
    expect(mocks.redirect).toHaveBeenCalledWith({
      href: `/trips/${TRIP}?idea=new-idea`,
      locale: "pt",
    });
  });

  it("returns the field errors and what was typed", async () => {
    const state = await plantIdea(
      { status: "idle" },
      form({ ...fields, title: "", lat: "" }),
    );
    expect(state).toMatchObject({
      status: "error",
      fieldErrors: { title: "titleRequired", place: "placeInvalid" },
      values: { kind: "food", lon: "-49.27" },
    });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});

describe("createTrip", () => {
  it("creates the trip with the person's session and opens it", async () => {
    mocks.insert.mockReturnValue({ data: { id: "new-trip" }, error: null });

    await expect(
      createTrip(
        { status: "idle" },
        form({
          name: "Brasil 2027",
          startsOn: "2027-01-12",
          endsOn: "2027-02-01",
          locale: "en",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.insert).toHaveBeenCalledWith({
      name: "Brasil 2027",
      starts_on: "2027-01-12",
      ends_on: "2027-02-01",
    });
    expect(mocks.redirect).toHaveBeenCalledWith({
      href: "/trips/new-trip",
      locale: "en",
    });
  });

  it("falls back to Spanish for an unknown locale", async () => {
    mocks.insert.mockReturnValue({ data: { id: "t" }, error: null });
    await expect(
      createTrip(
        { status: "idle" },
        form({ name: "Viaje", startsOn: "", endsOn: "", locale: "fr" }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith({
      href: "/trips/t",
      locale: "es",
    });
  });

  it("asks a signed-out person to log in again", async () => {
    mocks.user = null;
    const state = await createTrip(
      { status: "idle" },
      form({ name: "Viaje", startsOn: "", endsOn: "" }),
    );
    expect(state).toMatchObject({ status: "error", error: "signedOut" });
  });
});

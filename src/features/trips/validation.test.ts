import { describe, expect, it } from "vitest";
import {
  isDay,
  isUuid,
  normalizeUrl,
  parseComment,
  parseIdea,
  parseIdeaEdit,
  parseStage,
  parseTrip,
} from "./validation";

describe("parseTrip", () => {
  it("trims the name and keeps empty dates as null", () => {
    expect(
      parseTrip({ name: "  Brasil 2027 ", startsOn: "", endsOn: " " }),
    ).toEqual({
      ok: true,
      value: { name: "Brasil 2027", startsOn: null, endsOn: null },
    });
  });

  it("asks for a name of a sensible length", () => {
    expect(parseTrip({ name: " ", startsOn: "", endsOn: "" })).toEqual({
      ok: false,
      errors: { name: "nameRequired" },
    });
    expect(
      parseTrip({ name: "a".repeat(121), startsOn: "", endsOn: "" }),
    ).toEqual({ ok: false, errors: { name: "nameTooLong" } });
  });

  it("rejects impossible dates and an end before the start", () => {
    expect(
      parseTrip({ name: "Viaje", startsOn: "2027-02-30", endsOn: "" }),
    ).toEqual({ ok: false, errors: { startsOn: "dateInvalid" } });
    expect(
      parseTrip({
        name: "Viaje",
        startsOn: "2027-02-01",
        endsOn: "2027-01-12",
      }),
    ).toEqual({ ok: false, errors: { endsOn: "endBeforeStart" } });
    expect(
      parseTrip({
        name: "Viaje",
        startsOn: "2027-01-12",
        endsOn: "2027-02-01",
      }),
    ).toMatchObject({ ok: true });
  });
});

describe("parseIdea", () => {
  const empty = {
    kind: "place",
    title: "Pão de Açúcar",
    note: "",
    sourceUrl: "",
    stageId: "",
    lon: "",
    lat: "",
  };

  it("accepts an idea without place, link or stage", () => {
    expect(parseIdea(empty)).toEqual({
      ok: true,
      value: {
        kind: "place",
        title: "Pão de Açúcar",
        note: null,
        sourceUrl: null,
        stageId: null,
        lon: null,
        lat: null,
      },
    });
  });

  it("reads the place, the stage and the link", () => {
    const result = parseIdea({
      ...empty,
      note: " Al atardecer ",
      sourceUrl: "www.bondinho.com.br",
      stageId: "c0000000-0000-4000-8000-000000000001",
      lon: "-43.157",
      lat: "-22.949",
    });
    expect(result).toEqual({
      ok: true,
      value: {
        kind: "place",
        title: "Pão de Açúcar",
        note: "Al atardecer",
        sourceUrl: "https://www.bondinho.com.br/",
        stageId: "c0000000-0000-4000-8000-000000000001",
        lon: -43.157,
        lat: -22.949,
      },
    });
  });

  it("reports every field that is wrong", () => {
    expect(
      parseIdea({
        kind: "hotel",
        title: "",
        note: "x".repeat(2001),
        sourceUrl: "javascript:alert(1)",
        stageId: "rio",
        lon: "-43.1",
        lat: "",
      }),
    ).toEqual({
      ok: false,
      errors: {
        kind: "kindInvalid",
        title: "titleRequired",
        note: "noteTooLong",
        sourceUrl: "urlInvalid",
        stageId: "stageInvalid",
        place: "placeInvalid",
      },
    });
  });

  it("rejects coordinates off the globe", () => {
    expect(parseIdea({ ...empty, lon: "200", lat: "0" })).toMatchObject({
      ok: false,
      errors: { place: "placeInvalid" },
    });
  });
});

describe("normalizeUrl", () => {
  it.each([
    ["", null],
    [
      "https://www.serraverdeexpress.com.br",
      "https://www.serraverdeexpress.com.br/",
    ],
    ["instagram.com/p/abc", "https://instagram.com/p/abc"],
    ["ftp://example.com", undefined],
    ["not a link", undefined],
    ["localhost", undefined],
  ])("%s -> %s", (raw, expected) => {
    expect(normalizeUrl(raw)).toBe(expected);
  });
});

describe("parseComment", () => {
  it("trims the text and limits its length", () => {
    expect(parseComment("  ¡Vamos!  ")).toEqual({ ok: true, value: "¡Vamos!" });
    expect(parseComment("   ")).toEqual({
      ok: false,
      errors: { body: "bodyRequired" },
    });
    expect(parseComment("x".repeat(2001))).toEqual({
      ok: false,
      errors: { body: "bodyTooLong" },
    });
  });
});

describe("ids and days", () => {
  it("recognises uuids", () => {
    expect(isUuid("d0000000-0000-4000-8000-000000000001")).toBe(true);
    expect(isUuid("tren")).toBe(false);
    expect(isUuid(undefined)).toBe(false);
  });

  it("recognises real calendar days", () => {
    expect(isDay("2027-01-12")).toBe(true);
    expect(isDay("2027-13-01")).toBe(false);
    expect(isDay("12/01/2027")).toBe(false);
  });
});

describe("parseIdeaEdit", () => {
  it("trims the title and keeps an empty note as null", () => {
    expect(parseIdeaEdit({ title: "  Cataratas ", note: "  " })).toEqual({
      ok: true,
      value: { title: "Cataratas", note: null },
    });
  });

  it("rejects an empty title and a note that is too long", () => {
    expect(parseIdeaEdit({ title: " ", note: "a".repeat(2001) })).toEqual({
      ok: false,
      errors: { title: "titleRequired", note: "noteTooLong" },
    });
  });
});

describe("parseStage", () => {
  const base = {
    name: "Río",
    startsOn: "",
    endsOn: "",
    lon: "",
    lat: "",
    color: "",
  };

  it("accepts a stage with only a name", () => {
    expect(parseStage({ ...base, name: "  Río de Janeiro " })).toEqual({
      ok: true,
      value: {
        name: "Río de Janeiro",
        startsOn: null,
        endsOn: null,
        lon: null,
        lat: null,
        color: null,
      },
    });
  });

  it("keeps a known colour and drops an unknown one", () => {
    const picked = parseStage({ ...base, color: "berry" });
    expect(picked.ok && picked.value.color).toBe("berry");
    const unknown = parseStage({ ...base, color: "orange" });
    expect(unknown.ok && unknown.value.color).toBeNull();
  });

  it("keeps the place when both coordinates come", () => {
    const parsed = parseStage({ ...base, lon: "-43.2", lat: "-22.9" });
    expect(parsed.ok && parsed.value).toMatchObject({ lon: -43.2, lat: -22.9 });
  });

  it("rejects half a place and coordinates off the map", () => {
    expect(parseStage({ ...base, lon: "-43.2" })).toMatchObject({
      ok: false,
      errors: { place: "placeInvalid" },
    });
    expect(parseStage({ ...base, lon: "190", lat: "0" })).toMatchObject({
      ok: false,
      errors: { place: "placeInvalid" },
    });
  });

  it("asks for a name of at most 80 characters and ordered dates", () => {
    expect(parseStage({ ...base, name: " " })).toMatchObject({
      ok: false,
      errors: { name: "nameRequired" },
    });
    expect(parseStage({ ...base, name: "a".repeat(81) })).toMatchObject({
      ok: false,
      errors: { name: "nameTooLong" },
    });
    expect(
      parseStage({ ...base, startsOn: "2027-08-05", endsOn: "2027-08-01" }),
    ).toMatchObject({ ok: false, errors: { endsOn: "endBeforeStart" } });
  });
});

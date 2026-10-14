import { describe, expect, it } from "vitest";
import { linkPreview } from "./link-preview";

describe("linkPreview", () => {
  it("shows host and path of a video link", () => {
    expect(
      linkPreview("https://www.tiktok.com/@viajerosbr/video/7281?lang=es"),
    ).toEqual({
      href: "https://www.tiktok.com/@viajerosbr/video/7281?lang=es",
      line: "tiktok.com/@viajerosbr/video/7281",
      kind: "video",
    });
    expect(linkPreview("instagram.com/reel/abc")?.kind).toBe("video");
    expect(linkPreview("https://youtu.be/xyz")?.kind).toBe("video");
  });

  it("recognises map links", () => {
    expect(linkPreview("https://maps.app.goo.gl/AbC")?.kind).toBe("map");
    expect(
      linkPreview("https://www.google.com.br/maps/place/Morretes")?.kind,
    ).toBe("map");
    expect(linkPreview("https://www.google.com/search?q=x")?.kind).toBe("web");
  });

  it("treats anything else as a web page", () => {
    expect(linkPreview("serraverdeexpress.com.br/")).toEqual({
      href: "https://serraverdeexpress.com.br/",
      line: "serraverdeexpress.com.br",
      kind: "web",
    });
  });

  it("returns null for empty or invalid links", () => {
    expect(linkPreview("")).toBeNull();
    expect(linkPreview("   ")).toBeNull();
    expect(linkPreview("not a link")).toBeNull();
    expect(linkPreview("javascript:alert(1)")).toBeNull();
  });

  it("does not match look-alike hosts", () => {
    expect(linkPreview("https://nottiktok.com/x")?.kind).toBe("web");
  });
});

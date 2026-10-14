import { describe, expect, it } from "vitest";
import { readJpegGps } from "./exif";

type Gps = {
  lat: [number, number, number];
  latRef: string;
  lon: [number, number, number];
  lonRef: string;
};

function tiffBytes(little: boolean, gps: Gps | null) {
  const size = 8 + 18 + 54 + 48;
  const view = new DataView(new ArrayBuffer(size));
  const u16 = (at: number, value: number) => view.setUint16(at, value, little);
  const u32 = (at: number, value: number) => view.setUint32(at, value, little);
  view.setUint16(0, little ? 0x4949 : 0x4d4d);
  u16(2, 42);
  u32(4, 8);
  u16(8, 1);
  u16(10, gps ? 0x8825 : 0x010f);
  u16(12, 4);
  u32(14, 1);
  u32(18, 26);
  u32(22, 0);
  if (!gps) return new Uint8Array(view.buffer);
  const ifd = 26;
  u16(ifd, 4);
  const rationals = ifd + 2 + 4 * 12 + 4;
  const entry = (i: number, tag: number, type: number, count: number) => {
    const at = ifd + 2 + i * 12;
    u16(at, tag);
    u16(at + 2, type);
    u32(at + 4, count);
    return at + 8;
  };
  view.setUint8(entry(0, 1, 2, 2), gps.latRef.charCodeAt(0));
  u32(entry(1, 2, 5, 3), rationals);
  view.setUint8(entry(2, 3, 2, 2), gps.lonRef.charCodeAt(0));
  u32(entry(3, 4, 5, 3), rationals + 24);
  [...gps.lat, ...gps.lon].forEach((value, i) => {
    u32(rationals + i * 8, Math.round(value * 100));
    u32(rationals + i * 8 + 4, 100);
  });
  return new Uint8Array(view.buffer);
}

function jpeg(tiff: Uint8Array | null) {
  const app0 = [0xff, 0xe0, 0x00, 0x04, 0x00, 0x00];
  const exif = tiff
    ? [
        0xff,
        0xe1,
        (tiff.length + 8) >> 8,
        (tiff.length + 8) & 0xff,
        0x45,
        0x78,
        0x69,
        0x66,
        0,
        0,
        ...tiff,
      ]
    : [];
  return new Uint8Array([0xff, 0xd8, ...app0, ...exif, 0xff, 0xda, 0, 2])
    .buffer;
}

const curitiba: Gps = {
  lat: [25, 23, 12],
  latRef: "S",
  lon: [49, 0, 36],
  lonRef: "W",
};

describe("readJpegGps", () => {
  it("reads a southern and western position in little endian", () => {
    const place = readJpegGps(jpeg(tiffBytes(true, curitiba)));
    expect(place.status).toBe("found");
    if (place.status !== "found") return;
    expect(place.point.lat).toBeCloseTo(-25.3867, 4);
    expect(place.point.lon).toBeCloseTo(-49.01, 4);
  });

  it("reads a northern and eastern position in big endian", () => {
    const place = readJpegGps(
      jpeg(
        tiffBytes(false, {
          lat: [41, 23, 24.5],
          latRef: "N",
          lon: [2, 10, 12],
          lonRef: "E",
        }),
      ),
    );
    expect(place).toEqual({
      status: "found",
      point: { lat: expect.closeTo(41.3901, 4), lon: expect.closeTo(2.17, 4) },
    });
  });

  it("says when the photo has no position", () => {
    expect(readJpegGps(jpeg(tiffBytes(true, null)))).toEqual({
      status: "noGps",
    });
    expect(readJpegGps(jpeg(null))).toEqual({ status: "noGps" });
  });

  it("ignores a zero position", () => {
    const zero: Gps = {
      lat: [0, 0, 0],
      latRef: "N",
      lon: [0, 0, 0],
      lonRef: "E",
    };
    expect(readJpegGps(jpeg(tiffBytes(true, zero)))).toEqual({
      status: "noGps",
    });
  });

  it("rejects files that are not JPEG", () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]).buffer;
    expect(readJpegGps(png)).toEqual({ status: "unreadable" });
  });

  it("survives a truncated file", () => {
    const whole = new Uint8Array(jpeg(tiffBytes(true, curitiba)));
    const cut = whole.slice(0, 40).buffer;
    expect(readJpegGps(cut).status).not.toBe("found");
  });
});

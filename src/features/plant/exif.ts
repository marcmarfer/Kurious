export type GpsPoint = { lon: number; lat: number };

export type PhotoPlace =
  | { status: "found"; point: GpsPoint }
  | { status: "noGps" }
  | { status: "unreadable" };

const SOI = 0xffd8;
const APP1 = 0xffe1;
const SOS = 0xffda;
const GPS_IFD_POINTER = 0x8825;
const GPS_LAT_REF = 1;
const GPS_LAT = 2;
const GPS_LON_REF = 3;
const GPS_LON = 4;
const RATIONAL = 5;
const SRATIONAL = 10;

type Tiff = { view: DataView; start: number; little: boolean };

function exifTiff(view: DataView): Tiff | null {
  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset);
    if ((marker & 0xff00) !== 0xff00 || marker === SOS) return null;
    const size = view.getUint16(offset + 2);
    if (size < 2) return null;
    const body = offset + 4;
    if (
      marker === APP1 &&
      body + 6 <= view.byteLength &&
      view.getUint32(body) === 0x45786966 &&
      view.getUint16(body + 4) === 0
    ) {
      const start = body + 6;
      if (start + 8 > view.byteLength) return null;
      const order = view.getUint16(start);
      if (order !== 0x4949 && order !== 0x4d4d) return null;
      const little = order === 0x4949;
      if (view.getUint16(start + 2, little) !== 42) return null;
      return { view, start, little };
    }
    offset = body + size - 2;
  }
  return null;
}

function entries(tiff: Tiff, ifd: number) {
  const { view, start, little } = tiff;
  const at = start + ifd;
  if (at + 2 > view.byteLength) return [];
  const count = view.getUint16(at, little);
  const list: { tag: number; type: number; count: number; entry: number }[] =
    [];
  for (let i = 0; i < count; i++) {
    const entry = at + 2 + i * 12;
    if (entry + 12 > view.byteLength) break;
    list.push({
      tag: view.getUint16(entry, little),
      type: view.getUint16(entry + 2, little),
      count: view.getUint32(entry + 4, little),
      entry,
    });
  }
  return list;
}

function degrees(
  tiff: Tiff,
  field: { type: number; count: number; entry: number },
) {
  const { view, start, little } = tiff;
  if ((field.type !== RATIONAL && field.type !== SRATIONAL) || field.count < 3)
    return null;
  const values = start + view.getUint32(field.entry + 8, little);
  if (values + 24 > view.byteLength) return null;
  const parts = [0, 1, 2].map((i) => {
    const numerator = view.getUint32(values + i * 8, little);
    const denominator = view.getUint32(values + i * 8 + 4, little);
    return denominator ? numerator / denominator : 0;
  });
  return parts[0] + parts[1] / 60 + parts[2] / 3600;
}

function ref(tiff: Tiff, field: { entry: number }) {
  return String.fromCharCode(tiff.view.getUint8(field.entry + 8));
}

export function readJpegGps(buffer: ArrayBuffer): PhotoPlace {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0) !== SOI)
    return { status: "unreadable" };
  try {
    const tiff = exifTiff(view);
    if (!tiff) return { status: "noGps" };
    const ifd0 = view.getUint32(tiff.start + 4, tiff.little);
    const pointer = entries(tiff, ifd0).find(
      (field) => field.tag === GPS_IFD_POINTER,
    );
    if (!pointer) return { status: "noGps" };
    const gps = entries(tiff, view.getUint32(pointer.entry + 8, tiff.little));
    const field = (tag: number) => gps.find((item) => item.tag === tag);
    const latField = field(GPS_LAT);
    const lonField = field(GPS_LON);
    if (!latField || !lonField) return { status: "noGps" };
    const latRef = field(GPS_LAT_REF);
    const lonRef = field(GPS_LON_REF);
    const lat = degrees(tiff, latField);
    const lon = degrees(tiff, lonField);
    if (lat === null || lon === null) return { status: "noGps" };
    const point = {
      lat: latRef && ref(tiff, latRef) === "S" ? -lat : lat,
      lon: lonRef && ref(tiff, lonRef) === "W" ? -lon : lon,
    };
    const valid =
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lon) &&
      Math.abs(point.lat) <= 90 &&
      Math.abs(point.lon) <= 180 &&
      (point.lat !== 0 || point.lon !== 0);
    return valid ? { status: "found", point } : { status: "noGps" };
  } catch {
    return { status: "unreadable" };
  }
}

import { normalizeUrl } from "@/features/trips/validation";

export type LinkKind = "video" | "map" | "web";

export type LinkPreview = { href: string; line: string; kind: LinkKind };

const VIDEO_HOSTS = [
  "tiktok.com",
  "instagram.com",
  "youtube.com",
  "youtu.be",
  "vimeo.com",
];

const MAP_HOSTS = ["maps.app.goo.gl", "maps.apple.com", "openstreetmap.org"];

const within = (host: string, domain: string) =>
  host === domain || host.endsWith(`.${domain}`);

function kindOf(url: URL): LinkKind {
  const host = url.hostname;
  if (VIDEO_HOSTS.some((domain) => within(host, domain))) return "video";
  if (MAP_HOSTS.some((domain) => within(host, domain))) return "map";
  if (/(^|\.)google\.[a-z.]+$/.test(host) && url.pathname.startsWith("/maps"))
    return "map";
  if (host === "goo.gl" && url.pathname.startsWith("/maps")) return "map";
  return "web";
}

function readable(path: string) {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

export function linkPreview(raw: string): LinkPreview | null {
  const href = normalizeUrl(raw);
  if (!href) return null;
  const url = new URL(href);
  const host = url.hostname.replace(/^www\./, "");
  const path = url.pathname === "/" ? "" : readable(url.pathname);
  return { href, line: `${host}${path}`, kind: kindOf(url) };
}

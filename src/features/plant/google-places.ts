type LatLngLike = { lat: () => number; lng: () => number };

export type FoundPlace = {
  id: string;
  name: string;
  lon: number;
  lat: number;
  bounds: [[number, number], [number, number]] | null;
};

type MapsNamespace = {
  importLibrary: (name: string) => Promise<unknown>;
};

const CALLBACK = "__kuriousMapsReady";

let loading: Promise<void> | null = null;

function mapsNamespace(): MapsNamespace | undefined {
  return (window as unknown as { google?: { maps?: MapsNamespace } }).google
    ?.maps;
}

export function loadPlacesUiKit(key: string, language: string) {
  if (mapsNamespace()?.importLibrary)
    return mapsNamespace()!
      .importLibrary("places")
      .then(() => undefined);
  loading ??= new Promise<void>((resolve, reject) => {
    const scope = window as unknown as Record<string, unknown>;
    scope[CALLBACK] = () => resolve();
    const params = new URLSearchParams({
      key,
      v: "weekly",
      loading: "async",
      language,
      callback: CALLBACK,
    });
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    script.onerror = () => reject(new Error("google-maps"));
    document.head.append(script);
  }).then(() => {
    const maps = mapsNamespace();
    if (!maps) throw new Error("google-maps");
    return maps.importLibrary("places").then(() => undefined);
  });
  return loading;
}

export function toFoundPlace(place: unknown): FoundPlace | null {
  const value = place as {
    id?: string;
    displayName?: string | null;
    location?: LatLngLike | null;
    viewport?: {
      toJSON: () => {
        south: number;
        west: number;
        north: number;
        east: number;
      };
    } | null;
  } | null;
  if (!value?.id || !value.location) return null;
  return {
    id: value.id,
    name: value.displayName ?? "",
    lon: value.location.lng(),
    lat: value.location.lat(),
    bounds: toBounds(value.viewport?.toJSON()),
  };
}

function toBounds(
  box: { south: number; west: number; north: number; east: number } | undefined,
): FoundPlace["bounds"] {
  if (!box || box.west > box.east) return null;
  return [
    [box.west, box.south],
    [box.east, box.north],
  ];
}

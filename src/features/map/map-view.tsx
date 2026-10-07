"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import type { Map as MapLibreMap } from "maplibre-gl";
import { useEffect, useRef } from "react";
import { INITIAL_VIEW, MAP_STYLE_URL, MAP_WORKER_URL } from "./map-config";

type MapViewProps = {
  className?: string;
  label: string;
};

export function MapView({ className, label }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let map: MapLibreMap | undefined;
    let cancelled = false;

    import("maplibre-gl").then(({ Map, setWorkerUrl }) => {
      if (cancelled) return;
      setWorkerUrl(MAP_WORKER_URL);
      map = new Map({
        container,
        style: MAP_STYLE_URL,
        center: INITIAL_VIEW.center,
        zoom: INITIAL_VIEW.zoom,
        attributionControl: { compact: true },
      });
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  // MapLibre's CSS forces position: relative on its container, so sizing goes on a wrapper.
  return (
    <div className={className}>
      <div
        ref={containerRef}
        role="region"
        aria-label={label}
        className="h-full w-full"
      />
    </div>
  );
}

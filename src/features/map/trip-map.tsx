"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import { useLocale, useTranslations } from "next-intl";
import {
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import type { Idea, Stage } from "@/features/trips/types";
import { INITIAL_VIEW, MAP_WORKER_URL } from "./map-config";
import {
  kuriousStyle,
  OVERLAY,
  overlayLayers,
  overlaySources,
} from "./kurious-style";
import {
  arc,
  boundsOf,
  ideaPinHtml,
  shapeCoords,
  chooseLeads,
  STAGE_LEAD,
  stagePinHtml,
  type Box,
  type LngLat,
} from "./trip-markers";
import { stageHexById } from "@/features/trips/stage-colors";

export type TripMapHandle = {
  select: (id: string | null) => void;
  fitTo: (ids?: string[], options?: { animate?: boolean }) => void;
  flyTo: (point: LngLat, zoom: number) => void;
  flyToBounds: (bounds: [LngLat, LngLat], maxZoom: number) => void;
};

export type MapInsets = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

type TripMapProps = {
  stages: Stage[];
  ideas: Idea[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onDeselect?: () => void;
  movableIds?: readonly string[];
  onMove?: (id: string, point: LngLat) => void;
  interactive?: boolean;
  focusIdeaId?: string | null;
  focusIds?: string[];
  showRoute?: boolean;
  insets?: MapInsets;
  className?: string;
  attributionClassName?: string;
  label?: string;
  onMapClick?: (point: LngLat) => void;
  draftPoint?: LngLat | null;
  ref?: Ref<TripMapHandle>;
};

type Pin = {
  marker: Marker;
  draggedAt?: number;
  el: HTMLButtonElement;
  html: string;
  z: number;
  stage?: {
    number: number;
    name: string;
    on: boolean;
    lead: LngLat;
    color: string;
  };
};

type Engine = {
  map: MapLibreMap;
  MarkerClass: typeof Marker;
  pins: Map<string, Pin>;
  selected: string | null;
  fitted: boolean;
  draft: Marker | null;
};

const MARGIN = 48;

const located = (idea: Idea): idea is Idea & { lon: number; lat: number } =>
  idea.lon !== null && idea.lat !== null;

const placed = (stage: Stage): stage is Stage & { lon: number; lat: number } =>
  stage.lon !== null && stage.lat !== null;

function padding(container: HTMLElement, insets: MapInsets) {
  const { clientWidth: w, clientHeight: h } = container;
  const side = (inset = 0, size: number) =>
    Math.max(0, Math.min(inset + MARGIN, size / 2 - 20));
  return {
    top: side(insets.top, h),
    bottom: side(insets.bottom, h),
    left: side(insets.left, w),
    right: side(insets.right, w),
  };
}

export function TripMap({
  stages,
  ideas,
  selectedId = null,
  onSelect,
  onDeselect,
  movableIds,
  onMove,
  interactive = true,
  focusIdeaId = null,
  focusIds,
  showRoute = true,
  insets = {},
  className = "relative h-full w-full",
  attributionClassName = "right-6 bottom-3.5",
  label,
  onMapClick,
  draftPoint = null,
  ref,
}: TripMapProps) {
  const t = useTranslations("Map3d");
  const tg = useTranslations("Growth");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const api = useRef<TripMapHandle | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">(
    "loading",
  );

  const emitSelect = useEffectEvent((id: string) => onSelect?.(id));
  const emitMove = useEffectEvent((id: string, point: LngLat) =>
    onMove?.(id, point),
  );
  const emitMapClick = useEffectEvent((point: LngLat) => {
    onMapClick?.(point);
    onDeselect?.();
  });

  const pointsFor = useEffectEvent((ids?: string[]): LngLat[] => {
    const wanted = ids ? new Set(ids) : null;
    const points: LngLat[] = [];
    for (const idea of ideas) {
      if (wanted && !wanted.has(idea.id)) continue;
      const coords = shapeCoords(idea.shape);
      if (coords.length) points.push(...coords);
      else if (located(idea)) points.push([idea.lon, idea.lat]);
    }
    for (const stage of stages) {
      if (wanted && !wanted.has(stage.id)) continue;
      if (placed(stage)) points.push([stage.lon, stage.lat]);
    }
    return points;
  });

  const fit = useEffectEvent((ids?: string[], animate = false) => {
    const engine = engineRef.current;
    const container = containerRef.current;
    const bounds = boundsOf(pointsFor(ids));
    if (!engine || !container || !bounds) return;
    if (!container.clientWidth || !container.clientHeight) return;
    engine.fitted = true;
    const single =
      bounds[0][0] === bounds[1][0] && bounds[0][1] === bounds[1][1];
    engine.map.fitBounds(bounds, {
      padding: padding(container, insets),
      maxZoom: single ? 11 : 12,
      animate,
      duration: animate ? 700 : 0,
    });
  });

  const declutter = useEffectEvent(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const { map, pins } = engine;
    const stagePins: (Pin & { stage: NonNullable<Pin["stage"]> })[] = [];
    const tags: Box[] = [];
    const obstacles: Box[] = [];
    for (const pin of pins.values()) {
      const { x, y } = map.project(pin.marker.getLngLat());
      if (!pin.stage) {
        const { offsetWidth: w, offsetHeight: h } = pin.el;
        obstacles.push({ x: x - w / 2, y: y - h + 2, w, h });
        continue;
      }
      const tag = pin.el.firstElementChild?.lastElementChild;
      if (!(tag instanceof HTMLElement) || !tag.offsetWidth) return;
      stagePins.push(pin as (typeof stagePins)[number]);
      tags.push({ x, y, w: tag.offsetWidth, h: tag.offsetHeight });
      obstacles.push({ x: x - 6, y: y - 6, w: 12, h: 12 });
    }
    const leads = chooseLeads(tags, obstacles);
    stagePins.forEach((pin, i) => {
      const lead = leads[i];
      const { number, name, on, lead: current, color } = pin.stage;
      if (lead[0] === current[0] && lead[1] === current[1]) return;
      pin.stage.lead = lead;
      pin.html = stagePinHtml(number, name, on, lead, color);
      pin.el.innerHTML = pin.html;
      pin.marker.setOffset(lead);
    });
  });

  const movableKey = movableIds?.join();

  const paint = useEffectEvent(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const { map, pins, MarkerClass } = engine;
    const keep = new Set<string>();
    const movable = new Set(movableIds);

    const upsert = (
      id: string,
      lngLat: LngLat,
      html: string,
      z: number,
      ariaLabel: string,
      anchor: "bottom" | "center",
      offset: LngLat,
    ) => {
      keep.add(id);
      const on = engine.selected === id;
      let pin = pins.get(id);
      if (!pin) {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "kurious-pin focus-ring cursor-pointer";
        const marker = new MarkerClass({ element: el, anchor, offset })
          .setLngLat(lngLat)
          .addTo(map);
        const created: Pin = { marker, el, html: "", z };
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          if (Date.now() - (created.draggedAt ?? 0) < 400) return;
          emitSelect(id);
        });
        marker.on("dragend", () => {
          created.draggedAt = Date.now();
          const { lng, lat } = marker.getLngLat();
          emitMove(id, [lng, lat]);
        });
        pin = created;
        pins.set(id, pin);
      }
      pin.marker.setLngLat(lngLat);
      pin.marker.setOffset(offset);
      pin.marker.setDraggable(movable.has(id));
      if (pin.html !== html) {
        pin.el.innerHTML = html;
        pin.html = html;
      }
      pin.z = z;
      pin.el.style.zIndex = String(z + (on ? 1000 : 0));
      pin.el.setAttribute("aria-label", ariaLabel);
      pin.el.setAttribute("aria-pressed", on ? "true" : "false");
      return pin;
    };

    const colors = stageHexById(stages);
    stages.filter(placed).forEach((stage, i) => {
      const on = engine.selected === stage.id;
      const color = colors.get(stage.id)!;
      const lead = pins.get(stage.id)?.stage?.lead ?? STAGE_LEAD;
      const pin = upsert(
        stage.id,
        [stage.lon, stage.lat],
        stagePinHtml(i + 1, stage.name, on, lead, color),
        on ? 18 : 6,
        t("stageMarker", { number: i + 1, name: stage.name }),
        "center",
        lead,
      );
      pin.stage = { number: i + 1, name: stage.name, on, lead, color };
    });

    ideas.filter(located).forEach((idea) => {
      const on = engine.selected === idea.id;
      upsert(
        idea.id,
        [idea.lon, idea.lat],
        ideaPinHtml(
          idea.id,
          idea.growth,
          on,
          idea.stageId ? colors.get(idea.stageId) : undefined,
        ),
        on ? 20 : idea.growth === "fire" ? 12 : 10,
        t("ideaMarker", { title: idea.title, growth: tg(idea.growth) }),
        "bottom",
        [0, 2],
      );
    });

    for (const [id, pin] of pins) {
      if (!keep.has(id)) {
        pin.marker.remove();
        pins.delete(id);
      }
    }

    const route = map.getSource(OVERLAY.route);
    if (route?.type === "geojson") {
      const coords = stages.filter(placed).map((s): LngLat => [s.lon, s.lat]);
      (route as GeoJSONSource).setData({
        type: "FeatureCollection",
        features:
          showRoute && coords.length > 1
            ? [
                {
                  type: "Feature",
                  properties: {},
                  geometry: { type: "LineString", coordinates: arc(coords) },
                },
              ]
            : [],
      });
    }

    const shapes = map.getSource(OVERLAY.shapes);
    if (shapes?.type === "geojson") {
      (shapes as GeoJSONSource).setData({
        type: "FeatureCollection",
        features: ideas
          .filter(
            (idea) =>
              idea.shape?.type === "LineString" ||
              idea.shape?.type === "Polygon",
          )
          .map((idea) => ({
            type: "Feature",
            id: idea.id,
            properties: {
              id: idea.id,
              hot: idea.growth === "fire",
              selected: engine.selected === idea.id,
            },
            geometry: idea.shape!,
          })),
      });
    }

    declutter();
  });

  const placeDraft = useEffectEvent(() => {
    const engine = engineRef.current;
    const container = containerRef.current;
    if (!engine || !container) return;
    engine.map.getCanvas().style.cursor = onMapClick ? "crosshair" : "";
    if (!draftPoint) {
      engine.draft?.remove();
      engine.draft = null;
      return;
    }
    if (!engine.draft) {
      const el = document.createElement("div");
      el.setAttribute("aria-hidden", "true");
      el.style.pointerEvents = "none";
      el.innerHTML = ideaPinHtml("draft", "seed", true);
      engine.draft = new engine.MarkerClass({
        element: el,
        anchor: "bottom",
        offset: [0, 2],
      })
        .setLngLat(draftPoint)
        .addTo(engine.map);
      el.style.zIndex = "2000";
    }
    engine.draft.setLngLat(draftPoint);
    const pad = padding(container, insets);
    const p = engine.map.project(draftPoint);
    const inside =
      p.x > pad.left &&
      p.x < container.clientWidth - pad.right &&
      p.y > pad.top &&
      p.y < container.clientHeight - pad.bottom;
    if (!inside) {
      engine.fitted = true;
      engine.map.easeTo({
        center: draftPoint,
        zoom: Math.max(engine.map.getZoom(), 11),
        padding: pad,
        duration: 700,
      });
    }
  });

  const select = useEffectEvent((id: string | null) => {
    const engine = engineRef.current;
    if (!engine || engine.selected === id) return;
    engine.selected = id;
    paint();
  });

  const mount = useEffectEvent((container: HTMLDivElement) => {
    let cancelled = false;
    import("maplibre-gl")
      .then(({ Map: MapLibre, Marker: MarkerClass, setWorkerUrl }) => {
        if (cancelled) return;
        setWorkerUrl(MAP_WORKER_URL);
        const map = new MapLibre({
          container,
          style: process.env.NEXT_PUBLIC_MAP_STYLE_URL || kuriousStyle(locale),
          center: INITIAL_VIEW.center,
          zoom: 5,
          attributionControl: false,
          interactive,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          renderWorldCopies: false,
          maxZoom: 15.5,
          fadeDuration: 300,
        });
        map.touchZoomRotate.disableRotation();
        engineRef.current = {
          map,
          MarkerClass,
          pins: new Map(),
          selected: selectedId ?? focusIdeaId,
          fitted: false,
          draft: null,
        };
        const initial = focusIds ?? (focusIdeaId ? [focusIdeaId] : undefined);
        map.on("style.load", () => {
          const before = map
            .getStyle()
            .layers.find((layer) => layer.type === "symbol")?.id;
          for (const [id, source] of Object.entries(overlaySources())) {
            if (!map.getSource(id)) map.addSource(id, source);
          }
          for (const layer of overlayLayers()) {
            if (!map.getLayer(layer.id)) map.addLayer(layer, before);
          }
          paint();
        });
        map.once("load", () => {
          if (!cancelled) setStatus("ready");
        });
        map.on("resize", () => {
          if (!engineRef.current?.fitted) fit(initial);
        });
        map.on("zoomend", () => declutter());
        map.on("click", (event) => {
          const target = event.originalEvent.target;
          if (target instanceof Element && target.closest(".kurious-pin"))
            return;
          emitMapClick([event.lngLat.lng, event.lngLat.lat]);
        });
        map.on("error", (event) => {
          const { sourceId } = event as { sourceId?: string };
          if (!sourceId && !map.isStyleLoaded() && !cancelled) {
            setStatus("failed");
          }
        });
        paint();
        fit(initial);
        placeDraft();
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });
    return () => {
      cancelled = true;
      const engine = engineRef.current;
      engineRef.current = null;
      if (!engine) return;
      engine.pins.forEach((pin) => pin.marker.remove());
      engine.draft?.remove();
      engine.map.remove();
    };
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    return mount(container);
  }, []);

  useEffect(() => {
    paint();
  }, [stages, ideas, showRoute, locale, movableKey]);

  useEffect(() => {
    select(selectedId);
  }, [selectedId]);

  const clickable = !!onMapClick;
  useEffect(() => {
    placeDraft();
  }, [draftPoint, clickable]);

  useEffect(() => {
    api.current = {
      flyToBounds: (bounds, maxZoom) => {
        const engine = engineRef.current;
        const container = containerRef.current;
        if (!engine || !container) return;
        engine.fitted = true;
        engine.map.fitBounds(bounds, {
          padding: padding(container, insets),
          maxZoom,
          duration: 900,
        });
      },
      flyTo: (point, zoom) => {
        const engine = engineRef.current;
        const container = containerRef.current;
        if (!engine || !container) return;
        engine.fitted = true;
        engine.map.flyTo({
          center: point,
          zoom,
          padding: padding(container, insets),
          duration: 900,
        });
      },
      select: (id) => {
        select(id);
        const engine = engineRef.current;
        const container = containerRef.current;
        const bounds = id ? boundsOf(pointsFor([id])) : null;
        if (!engine || !container || !bounds) return;
        const pad = padding(container, insets);
        const p = engine.map.project([
          (bounds[0][0] + bounds[1][0]) / 2,
          (bounds[0][1] + bounds[1][1]) / 2,
        ]);
        const inside =
          p.x > pad.left &&
          p.x < container.clientWidth - pad.right &&
          p.y > pad.top &&
          p.y < container.clientHeight - pad.bottom;
        if (!inside) fit([id!], true);
      },
      fitTo: (ids, options) => fit(ids, options?.animate ?? true),
    };
  });

  useImperativeHandle(
    ref,
    () => ({
      select: (id) => api.current?.select(id),
      fitTo: (ids, options) => api.current?.fitTo(ids, options),
      flyTo: (point, zoom) => api.current?.flyTo(point, zoom),
      flyToBounds: (bounds, maxZoom) =>
        api.current?.flyToBounds(bounds, maxZoom),
    }),
    [],
  );

  const { top = 0, bottom = 0, left = 0, right = 0 } = insets;

  // MapLibre's CSS forces position: relative on its container, so sizing goes on a wrapper.
  return (
    <div className={className}>
      <div className="bg-parchment relative size-full overflow-hidden">
        <div
          ref={containerRef}
          role="region"
          aria-label={label ?? t("mapLabel")}
          className="h-full w-full"
        />
        {status !== "ready" && (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{
              paddingTop: top,
              paddingBottom: bottom,
              paddingLeft: left,
              paddingRight: right,
            }}
          >
            <span
              role="status"
              className={`bg-cream/92 text-forest-dark flex items-center rounded-full px-4 text-center text-[13px] font-bold shadow-[0_4px_14px_rgba(31,42,36,.15)] lg:text-sm ${status === "failed" ? "max-w-xs py-2.5" : "h-9 lg:h-[38px]"}`}
            >
              {status === "failed" ? t("mapFailed") : t("mapLoading")}
            </span>
          </div>
        )}
        <span
          className={`text-ink/72 pointer-events-none absolute text-[9.5px] leading-none font-semibold [text-shadow:0_0_3px_rgba(252,251,246,.9)] lg:text-[10.5px] ${attributionClassName}`}
        >
          {t("attribution2d")}
        </span>
      </div>
    </div>
  );
}

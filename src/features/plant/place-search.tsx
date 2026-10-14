"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Collapse } from "@/components/collapse";
import {
  loadPlacesUiKit,
  toFoundPlace,
  type FoundPlace,
} from "./google-places";

type Status = "loading" | "ready" | "failed";

type AutocompleteElement = HTMLElement & {
  locationBias?: { lat: number; lng: number } | null;
};
type DetailsElement = HTMLElement & { place?: unknown };
type DetailsRequest = HTMLElement & { place: string | null };

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";

const THEME = [
  "color-scheme: light",
  "--gmp-mat-color-surface: #fcfbf6",
  "--gmp-mat-color-on-surface: #1f2a24",
  "--gmp-mat-color-on-surface-variant: #5f6b63",
  "--gmp-mat-color-primary: #1d4736",
  "--gmp-mat-color-outline-decorative: #e4e6dc",
  "--gmp-mat-color-positive: #2e6a4e",
  "--gmp-mat-color-negative: #9f2d1b",
  "--gmp-mat-font-family: var(--font-nunito), system-ui, sans-serif",
].join(";");

const ROTATE_MS = 3600;
const FADE_MS = 450;

const BOX = [
  "width: 100%",
  "height: 54px",
  "border-radius: 18px",
  "border: 1px solid #e4e6dc",
  "background-color: #fcfbf6",
  "box-shadow: 0 1px 2px rgb(31 42 36 / 0.06), 0 6px 16px rgb(31 42 36 / 0.08)",
].join(";");

export function PlaceSearch({
  near,
  placed,
  onPick,
}: {
  near: { lat: number; lng: number } | null;
  placed: boolean;
  onPick: (place: FoundPlace) => void;
}) {
  const t = useTranslations("Plant");
  const locale = useLocale();
  const boxHost = useRef<HTMLDivElement>(null);
  const cardHost = useRef<HTMLDivElement>(null);
  const autocomplete = useRef<AutocompleteElement | null>(null);
  const pick = useRef(onPick);
  const examples = [
    t("search.placeholder"),
    t("search.example1"),
    t("search.example2"),
    t("search.example3"),
  ];
  const [turn, setTurn] = useState(0);
  const [fading, setFading] = useState(false);
  const [typed, setTyped] = useState(false);

  useEffect(() => {
    let swap: number | undefined;
    const rotation = window.setInterval(() => {
      setFading(true);
      swap = window.setTimeout(() => {
        setTurn((value) => value + 1);
        setFading(false);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => {
      window.clearInterval(rotation);
      window.clearTimeout(swap);
    };
  }, []);
  const [status, setStatus] = useState<Status>("loading");
  const [picked, setPicked] = useState(false);

  useEffect(() => {
    pick.current = onPick;
  }, [onPick]);

  useEffect(() => {
    if (autocomplete.current) autocomplete.current.locationBias = near;
  }, [near]);

  useEffect(() => {
    if (!KEY) return;
    let cancelled = false;
    const created: HTMLElement[] = [];
    loadPlacesUiKit(KEY, locale)
      .then(() => {
        if (cancelled || !boxHost.current || !cardHost.current) return;

        const box = document.createElement(
          "gmp-basic-place-autocomplete",
        ) as AutocompleteElement;
        box.style.cssText = `${THEME};${BOX}`;
        box.addEventListener("input", () => setTyped(true));

        const details = document.createElement(
          "gmp-place-details-compact",
        ) as DetailsElement;
        details.setAttribute("orientation", "horizontal");
        details.style.cssText = `${THEME};width:100%`;
        const request = document.createElement(
          "gmp-place-details-place-request",
        ) as DetailsRequest;
        details.append(
          request,
          document.createElement("gmp-place-all-content"),
        );

        box.addEventListener("gmp-select", (event) => {
          const id = (event as Event & { place?: { id?: string } }).place?.id;
          if (!id) return;
          request.place = id;
          setPicked(true);
          setTyped(false);
        });
        details.addEventListener("gmp-load", () => {
          const found = toFoundPlace(details.place);
          if (found) pick.current(found);
        });

        boxHost.current.append(box);
        cardHost.current.append(details);
        created.push(box, details);
        autocomplete.current = box;
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });
    return () => {
      cancelled = true;
      for (const element of created) element.remove();
      autocomplete.current = null;
    };
  }, [locale]);

  if (!KEY || status === "failed") return null;

  return (
    <div className="flex flex-col">
      <div className="relative">
        <div ref={boxHost} aria-label={t("search.label")} />
        {!typed && status === "ready" && (
          <span
            aria-hidden="true"
            style={{ transitionDuration: `${FADE_MS}ms` }}
            className={`text-muted pointer-events-none absolute top-1/2 right-4 left-[52px] -translate-y-1/2 truncate text-base transition-opacity ease-in-out ${fading ? "opacity-0" : "opacity-100"}`}
          >
            {examples[turn % examples.length]}
          </span>
        )}
      </div>
      <Collapse open={picked}>
        <div className="pt-2">
          <div
            ref={cardHost}
            className="border-line shadow-card overflow-hidden rounded-[18px] border"
          />
        </div>
      </Collapse>
      <Collapse open={picked && !placed}>
        <div className="pt-2">
          <p
            role="status"
            className="bg-forest-soft text-forest-dark rounded-xl px-3.5 py-2.5 text-[13px] leading-[1.4] font-bold"
          >
            {t("search.found")}
          </p>
        </div>
      </Collapse>
    </div>
  );
}

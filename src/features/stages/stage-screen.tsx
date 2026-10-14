"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState, useId, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  ChevronLeftIcon,
  PinIcon,
  PinOffIcon,
  SpinnerIcon,
} from "@/components/icons";
import { TripMap, type TripMapHandle } from "@/features/map/trip-map";
import type { FoundPlace } from "@/features/plant/google-places";
import { PlaceSearch } from "@/features/plant/place-search";
import { CARD, FIELD_ERROR, GROUP_LABEL } from "@/features/plant/plant-ui";
import {
  deleteStage,
  saveStage,
  type StageFormState,
} from "@/features/trips/stage-actions";
import {
  STAGE_COLORS,
  STAGE_COLOR_KEYS,
  stageColorKey,
  type StageColor,
} from "@/features/trips/stage-colors";
import type { Stage, Trip } from "@/features/trips/types";
import {
  MAX_STAGE_NAME_LENGTH,
  type StageFieldError,
} from "@/features/trips/validation";
import { Link } from "@/i18n/navigation";

const IDLE: StageFormState = { status: "idle" };

const WIDE = "(min-width: 64rem)";

const DRAFT_ID = "draft";

const DATE_INPUT =
  "text-ink h-8 w-full min-w-0 bg-transparent text-[15px] font-semibold outline-none";

type Point = [number, number];

export function StageScreen({
  trip,
  stage,
}: {
  trip: Trip;
  stage: Stage | null;
}) {
  const t = useTranslations("Stages");
  const locale = useLocale();
  const ids = { name: useId(), start: useId(), end: useId() };
  const mapRef = useRef<TripMapHandle>(null);
  const mapBoxRef = useRef<HTMLDivElement>(null);
  const [state, action, pending] = useActionState(
    saveStage.bind(null, trip.id, stage?.id ?? null),
    IDLE,
  );
  const [name, setName] = useState(stage?.name ?? "");
  const index = stage ? trip.stages.indexOf(stage) : trip.stages.length;
  const [color, setColor] = useState<StageColor>(
    stageColorKey(stage ?? { color: null }, index),
  );
  const [point, setPoint] = useState<Point | null>(
    stage && stage.lon !== null && stage.lat !== null
      ? [stage.lon, stage.lat]
      : null,
  );

  const fields = state.fieldErrors ?? {};
  const fieldError = (code?: StageFieldError) =>
    code ? t(`errors.${code}`, { max: MAX_STAGE_NAME_LENGTH }) : null;
  const others = trip.stages.filter((item) => item.id !== stage?.id);
  const draft: Stage = {
    id: DRAFT_ID,
    position: stage?.position ?? Number.MAX_SAFE_INTEGER,
    name: name.trim() || t("newTitle"),
    startsOn: null,
    endsOn: null,
    lon: point ? point[0] : null,
    lat: point ? point[1] : null,
    color,
  };
  const shown = stage
    ? trip.stages.map((item) => (item.id === stage.id ? draft : item))
    : [...trip.stages, draft];
  const located = [...others, ...trip.ideas].filter(
    (item) => item.lon !== null && item.lat !== null,
  );
  const searchNear = point
    ? { lat: point[1], lng: point[0] }
    : located.length
      ? {
          lat:
            located.reduce((sum, item) => sum + (item.lat ?? 0), 0) /
            located.length,
          lng:
            located.reduce((sum, item) => sum + (item.lon ?? 0), 0) /
            located.length,
        }
      : null;

  function goToFound(found: FoundPlace) {
    if (found.bounds) mapRef.current?.flyToBounds(found.bounds, 12);
    else mapRef.current?.flyTo([found.lon, found.lat], 11);
    if (!name.trim() && found.name) setName(found.name);
    if (!window.matchMedia(WIDE).matches)
      mapBoxRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }

  return (
    <form
      action={action}
      noValidate
      className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#F4F1E8] lg:grid lg:grid-cols-[520px_minmax(0,1fr)] lg:grid-rows-[auto_1fr]"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="color" value={color} />
      <input type="hidden" name="lon" value={point ? String(point[0]) : ""} />
      <input type="hidden" name="lat" value={point ? String(point[1]) : ""} />

      <div className="flex flex-col gap-3.5 px-4 pt-[calc(env(safe-area-inset-top)+16px)] lg:col-start-1 lg:row-start-1 lg:gap-[18px] lg:border-r lg:border-[#E4E2D8] lg:px-8 lg:pt-8">
        <header className="flex h-11 items-center gap-3">
          <Link
            href={`/trips/${trip.id}/plan`}
            aria-label={t("back")}
            className="focus-ring bg-cream text-ink flex size-[42px] shrink-0 items-center justify-center rounded-full border border-[#E1E3D8] shadow-[0_2px_8px_rgba(31,42,36,.08)]"
          >
            <ChevronLeftIcon className="size-5" strokeWidth={2.2} />
          </Link>
          <h1 className="font-display text-ink grow text-[21px] leading-[1.1] font-semibold lg:text-[28px]">
            {stage ? t("editTitle") : t("newTitle")}
          </h1>
        </header>

        <PlaceSearch
          near={searchNear}
          placed={point !== null}
          onPick={goToFound}
        />

        <p className="text-sm leading-[1.45] text-[#2B3530]">{t("guide")}</p>
      </div>

      <div
        ref={mapBoxRef}
        className="bg-parchment relative mt-3.5 h-[400px] shrink-0 overflow-hidden lg:sticky lg:top-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:h-dvh"
      >
        <TripMap
          ref={mapRef}
          stages={shown}
          selectedId={DRAFT_ID}
          ideas={trip.ideas}
          focusIds={stage && point ? [DRAFT_ID] : others.map((item) => item.id)}
          onMapClick={setPoint}
          insets={{ bottom: 36 }}
          className="absolute inset-0"
          attributionClassName="right-2.5 top-2"
          label={t("mapLabel")}
        />
        <p
          aria-live="polite"
          className="bg-cream/92 text-ink pointer-events-none absolute bottom-3 left-3 flex h-8 max-w-[calc(100%-24px)] items-center gap-[7px] rounded-2xl border border-white/60 pr-3 pl-1.5 text-xs font-bold shadow-[0_4px_14px_rgba(31,42,36,.2)] backdrop-blur-[10px]"
        >
          <span className="bg-forest-dark text-cream flex h-[22px] shrink-0 items-center rounded-[11px] px-1.5">
            <PinIcon className="size-3.5" strokeWidth={2.4} />
          </span>
          <span className="truncate">
            {point ? t("hint.move") : t("hint.tap")}
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-3 px-4 pt-3.5 pb-[calc(env(safe-area-inset-bottom)+24px)] lg:col-start-1 lg:row-start-2 lg:gap-[18px] lg:border-r lg:border-[#E4E2D8] lg:px-8 lg:pt-[18px] lg:pb-7">
        <div className="flex flex-col gap-1.5">
          <div
            className={`${CARD} flex flex-col gap-1 px-3.5 pt-2.5 pb-2 ${fields.name ? "border-danger" : ""}`}
          >
            <label
              htmlFor={ids.name}
              className="text-muted text-xs leading-[1.2] font-bold"
            >
              {t("name.label")}
            </label>
            <input
              id={ids.name}
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={MAX_STAGE_NAME_LENGTH}
              autoComplete="off"
              required
              placeholder={t("name.placeholder")}
              aria-invalid={fields.name ? true : undefined}
              aria-describedby={fields.name ? `${ids.name}-error` : undefined}
              className="font-display text-ink placeholder:text-muted/60 h-8 w-full min-w-0 bg-transparent text-[17px] font-semibold outline-none placeholder:font-medium"
            />
          </div>
          {fields.name && (
            <p id={`${ids.name}-error`} className={`${FIELD_ERROR} px-1`}>
              {fieldError(fields.name)}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div
              className={`${CARD} flex flex-col gap-1 px-3.5 pt-2.5 pb-2 ${fields.startsOn ? "border-danger" : ""}`}
            >
              <label
                htmlFor={ids.start}
                className="text-muted text-xs leading-[1.2] font-bold"
              >
                {t("startsOn")}
              </label>
              <input
                id={ids.start}
                name="startsOn"
                type="date"
                defaultValue={stage?.startsOn ?? ""}
                aria-invalid={fields.startsOn ? true : undefined}
                className={DATE_INPUT}
              />
            </div>
            <div
              className={`${CARD} flex flex-col gap-1 px-3.5 pt-2.5 pb-2 ${fields.endsOn ? "border-danger" : ""}`}
            >
              <label
                htmlFor={ids.end}
                className="text-muted text-xs leading-[1.2] font-bold"
              >
                {t("endsOn")}
              </label>
              <input
                id={ids.end}
                name="endsOn"
                type="date"
                defaultValue={stage?.endsOn ?? ""}
                aria-invalid={fields.endsOn ? true : undefined}
                className={DATE_INPUT}
              />
            </div>
          </div>
          {(fields.startsOn || fields.endsOn) && (
            <p className={`${FIELD_ERROR} px-1`}>
              {fieldError(fields.startsOn ?? fields.endsOn)}
            </p>
          )}
          <p className={`${GROUP_LABEL} px-1`}>{t("datesHint")}</p>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className={`${GROUP_LABEL} mb-2`}>{t("color.label")}</legend>
          <div className="flex flex-wrap gap-2.5">
            {STAGE_COLOR_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={color === key}
                aria-label={t(`color.${key}`)}
                title={t(`color.${key}`)}
                onClick={() => setColor(key)}
                className={`focus-ring size-9 cursor-pointer rounded-full ${color === key ? "ring-forest-dark ring-2 ring-offset-2 ring-offset-[#F4F1E8]" : ""}`}
                style={{ backgroundColor: STAGE_COLORS[key] }}
              />
            ))}
          </div>
          <p className={GROUP_LABEL}>{t("color.hint")}</p>
        </fieldset>

        <div className="flex min-h-11 items-center justify-between gap-3">
          <p className={GROUP_LABEL}>
            {point ? t("place.set") : t("place.unset")}
          </p>
          {point && (
            <button
              type="button"
              onClick={() => setPoint(null)}
              className="border-stone text-ink bg-cream hover:border-forest-dark focus-ring flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border-[1.5px] px-3 text-[13px] font-extrabold"
            >
              <PinOffIcon className="size-4" />
              {t("place.remove")}
            </button>
          )}
        </div>
        {fields.place && (
          <p className={FIELD_ERROR}>{fieldError(fields.place)}</p>
        )}

        {state.error && (
          <p
            role="alert"
            className="bg-danger-soft text-danger rounded-xl px-3.5 py-2.5 text-[13px] leading-[1.4] font-bold"
          >
            {t(`errors.${state.error}`)}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || name.trim() === ""}
          aria-busy={pending || undefined}
          className="focus-ring bg-pinhao text-cream flex h-14 cursor-pointer items-center justify-center gap-2.5 rounded-[18px] px-4 text-base font-extrabold shadow-[0_2px_4px_rgba(94,44,22,.18),0_10px_22px_rgba(142,74,42,.35)] transition-[background-color,box-shadow,opacity] hover:bg-[#7B3F23] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
        >
          {pending && <SpinnerIcon className="size-5 animate-spin" />}
          {pending ? t("saving") : stage ? t("save") : t("create")}
        </button>

        {stage && (
          <ConfirmDialog
            title={t("delete.title", { name: stage.name })}
            body={t("delete.body")}
            confirmLabel={t("delete.action")}
            onConfirm={() => deleteStage(trip.id, stage.id, locale)}
            trigger={(open) => (
              <button
                type="button"
                onClick={open}
                className="border-stone text-danger hover:border-danger focus-ring h-11 w-full cursor-pointer rounded-[14px] border-[1.5px] bg-white px-4 font-extrabold"
              >
                {t("delete.action")}
              </button>
            )}
          />
        )}
      </div>
    </form>
  );
}

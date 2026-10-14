"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  startTransition,
  useActionState,
  useId,
  useRef,
  useState,
} from "react";
import {
  ChevronLeftIcon,
  PinIcon,
  SeedIcon,
  SpinnerIcon,
} from "@/components/icons";
import { KindDot } from "@/components/kind-label";
import { TripMap, type TripMapHandle } from "@/features/map/trip-map";
import { plantIdea, type PlantFormState } from "@/features/trips/actions";
import { IDEA_KINDS } from "@/features/trips/growth";
import { stageHex } from "@/features/trips/stage-colors";
import { nearestStage } from "@/features/trips/stage-match";
import type { IdeaKind, Trip } from "@/features/trips/types";
import {
  MAX_IDEA_TITLE_LENGTH,
  MAX_NOTE_LENGTH,
  type IdeaFieldError,
} from "@/features/trips/validation";
import { Link } from "@/i18n/navigation";
import type { GpsPoint } from "./exif";
import { LinkField } from "./link-field";
import { NewStageChip } from "./new-stage-chip";
import type { FoundPlace } from "./google-places";
import { PlaceRow, type PlaceSource } from "./place-row";
import { PlaceSearch } from "./place-search";
import {
  CARD,
  CHIP,
  CHIP_OFF,
  CHIP_ON,
  FIELD_ERROR,
  GROUP_LABEL,
} from "./plant-ui";

const IDLE: PlantFormState = { status: "idle" };

const WIDE = "(min-width: 64rem)";

type Point = [number, number];

export function PlantScreen({
  trip,
  initialStageId,
  initialKind,
}: {
  trip: Trip;
  initialStageId: string | null;
  initialKind: IdeaKind;
}) {
  const t = useTranslations("Plant");
  const tk = useTranslations("Kinds");
  const nav = useTranslations("Nav");
  const locale = useLocale();
  const ids = { title: useId(), note: useId(), need: useId() };
  const mapRef = useRef<TripMapHandle>(null);
  const mapBoxRef = useRef<HTMLDivElement>(null);
  const [state, action, pending] = useActionState(plantIdea, IDLE);

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<IdeaKind>(initialKind);
  const [stageId, setStageId] = useState<string | null>(initialStageId);
  const [note, setNote] = useState("");
  const [point, setPoint] = useState<Point | null>(null);
  const [source, setSource] = useState<PlaceSource | null>(null);
  const [handActive, setHandActive] = useState(false);
  const [stagePicked, setStagePicked] = useState(initialStageId !== null);

  const stage = trip.stages.find((item) => item.id === stageId) ?? null;
  const canAddStage = trip.myRole !== "guest";
  const stageArea = (id: string | null) => {
    const located = trip.stages.find(
      (item) => item.id === id && item.lon !== null,
    );
    if (!located) return undefined;
    const ideas = trip.ideas.filter((idea) => idea.stageId === located.id);
    return [located.id, ...ideas.map((idea) => idea.id)];
  };
  const fields = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const fieldError = (code?: IdeaFieldError) =>
    code
      ? t(`errors.${code}`, {
          max: code === "noteTooLong" ? MAX_NOTE_LENGTH : MAX_IDEA_TITLE_LENGTH,
        })
      : null;
  const formError =
    state.status === "error" && state.error ? t(`errors.${state.error}`) : null;
  const ready = title.trim() !== "";

  function chooseStage(id: string | null) {
    setStagePicked(true);
    setStageId(id);
    if (point) return;
    mapRef.current?.fitTo(stageArea(id));
  }

  function place(next: Point, from: PlaceSource) {
    if (!stagePicked) {
      const near = nearestStage({ lon: next[0], lat: next[1] }, trip.stages);
      if (near) setStageId(near.id);
    }
    setPoint(next);
    setSource(from);
    setHandActive(false);
  }

  function goToFound(found: FoundPlace) {
    if (found.bounds) mapRef.current?.flyToBounds(found.bounds, 16);
    else mapRef.current?.flyTo([found.lon, found.lat], 16);
    if (!title.trim() && found.name) setTitle(found.name);
    startHand();
  }

  const searchNear = (() => {
    const located =
      trip.stages.find((item) => item.id === stageId && item.lon !== null) ??
      null;
    if (located?.lon != null && located.lat != null)
      return { lat: located.lat, lng: located.lon };
    const placed = trip.ideas.filter(
      (idea) => idea.lon !== null && idea.lat !== null,
    );
    if (!placed.length) return null;
    return {
      lat:
        placed.reduce((sum, idea) => sum + (idea.lat ?? 0), 0) / placed.length,
      lng:
        placed.reduce((sum, idea) => sum + (idea.lon ?? 0), 0) / placed.length,
    };
  })();

  function startHand() {
    setHandActive(true);
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
      onSubmit={(event) => {
        event.preventDefault();
        if (pending) return;
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}
      className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#F4F1E8] lg:grid lg:grid-cols-[520px_minmax(0,1fr)] lg:grid-rows-[auto_1fr]"
    >
      <input type="hidden" name="tripId" value={trip.id} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="lon" value={point ? String(point[0]) : ""} />
      <input type="hidden" name="lat" value={point ? String(point[1]) : ""} />

      <div className="flex flex-col gap-3.5 px-4 pt-[calc(env(safe-area-inset-top)+16px)] lg:col-start-1 lg:row-start-1 lg:gap-[18px] lg:border-r lg:border-[#E4E2D8] lg:px-8 lg:pt-8">
        <header className="flex h-11 items-center gap-3">
          <Link
            href={`/trips/${trip.id}`}
            aria-label={nav("backToMap")}
            className="focus-ring bg-cream text-ink flex size-[42px] shrink-0 items-center justify-center rounded-full border border-[#E1E3D8] shadow-[0_2px_8px_rgba(31,42,36,.08)]"
          >
            <ChevronLeftIcon className="size-5" strokeWidth={2.2} />
          </Link>
          <h1 className="font-display text-ink grow text-[21px] leading-[1.1] font-semibold lg:text-[28px]">
            {t("title")}
          </h1>
        </header>

        <PlaceSearch
          near={searchNear}
          placed={point !== null}
          onPick={goToFound}
        />

        <LinkField
          value={url}
          onChange={setUrl}
          title={title}
          serverError={fieldError(fields.sourceUrl)}
        />

        <div className="flex items-start gap-2.5">
          <span className="bg-forest-dark mt-px flex size-[30px] shrink-0 items-center justify-center rounded-full">
            <SeedIcon className="size-4 text-[#CFE3C6]" strokeWidth={1.8} />
          </span>
          <p className="text-sm leading-[1.45] text-[#2B3530]">
            {t.rich("guide", {
              b: (chunks) => (
                <b className="text-ink font-extrabold">{chunks}</b>
              ),
            })}
          </p>
        </div>
      </div>

      <div
        ref={mapBoxRef}
        className="bg-parchment relative mt-3.5 h-[440px] shrink-0 overflow-hidden lg:sticky lg:top-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:h-dvh"
      >
        <TripMap
          ref={mapRef}
          stages={trip.stages}
          ideas={trip.ideas}
          selectedId={stageId}
          focusIds={stageArea(initialStageId)}
          onSelect={(id) => {
            if (trip.stages.some((item) => item.id === id)) chooseStage(id);
          }}
          onMapClick={(next) => place(next, "hand")}
          draftPoint={point}
          insets={{ bottom: 36 }}
          className="absolute inset-0"
          attributionClassName="right-2.5 top-2"
          label={t("mapLabel")}
        />
        <p
          aria-live="polite"
          className={`pointer-events-none absolute bottom-3 left-3 flex h-8 max-w-[calc(100%-24px)] items-center gap-[7px] rounded-2xl border pr-3 pl-1.5 text-xs font-bold shadow-[0_4px_14px_rgba(31,42,36,.2)] backdrop-blur-[10px] transition-colors ${handActive && !point ? "bg-forest-dark text-cream border-forest-dark" : "bg-cream/92 text-ink border-white/60"}`}
        >
          <span
            className={`flex h-[22px] shrink-0 items-center rounded-[11px] px-1.5 ${handActive && !point ? "bg-cream text-forest-dark" : "bg-forest-dark text-cream"}`}
          >
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
            className={`${CARD} flex flex-col gap-1 px-3.5 pt-2.5 pb-2 ${fields.title ? "border-danger" : ""}`}
          >
            <label
              htmlFor={ids.title}
              className="text-muted text-xs leading-[1.2] font-bold"
            >
              {t("name.label")}
            </label>
            <input
              id={ids.title}
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={MAX_IDEA_TITLE_LENGTH}
              autoComplete="off"
              required
              placeholder={t("name.placeholder")}
              aria-invalid={fields.title ? true : undefined}
              aria-describedby={fields.title ? `${ids.title}-error` : undefined}
              className="font-display text-ink placeholder:text-muted/60 h-8 w-full min-w-0 bg-transparent text-[17px] font-semibold outline-none placeholder:font-medium"
            />
          </div>
          {fields.title && (
            <p id={`${ids.title}-error`} className={`${FIELD_ERROR} px-1`}>
              {fieldError(fields.title)}
            </p>
          )}
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className={`${GROUP_LABEL} mb-2`}>{t("kind")}</legend>
          <div className="flex flex-wrap gap-2">
            {IDEA_KINDS.map((item) => (
              <label
                key={item}
                className={`${CHIP} ${kind === item ? CHIP_ON : CHIP_OFF}`}
              >
                <input
                  type="radio"
                  name="kind"
                  value={item}
                  checked={kind === item}
                  onChange={() => setKind(item)}
                  className="sr-only"
                />
                <KindDot kind={item} className="size-2.5" />
                {tk(item)}
              </label>
            ))}
          </div>
          {fields.kind && (
            <p className={FIELD_ERROR}>{fieldError(fields.kind)}</p>
          )}
        </fieldset>

        {(trip.stages.length > 0 || canAddStage) && (
          <fieldset className="flex flex-col gap-2">
            <legend className={`${GROUP_LABEL} mb-2`}>
              {t("stage.label")}
            </legend>
            <div className="flex flex-wrap gap-2">
              {trip.stages.map((item, index) => {
                const on = stageId === item.id;
                return (
                  <label
                    key={item.id}
                    className={`${CHIP} max-w-full pl-[5px] ${on ? CHIP_ON : CHIP_OFF}`}
                  >
                    <input
                      type="radio"
                      name="stageId"
                      value={item.id}
                      checked={on}
                      onChange={() => chooseStage(item.id)}
                      className="sr-only"
                    />
                    <span
                      className="text-cream flex size-[22px] shrink-0 items-center justify-center rounded-full text-[11.5px] font-extrabold"
                      style={{ backgroundColor: stageHex(item, index) }}
                    >
                      <span className="leading-none [text-box:trim-both_cap_alphabetic]">
                        {index + 1}
                      </span>
                    </span>
                    <span className="font-display truncate text-[14px] font-semibold">
                      {item.name}
                    </span>
                  </label>
                );
              })}
              <label
                className={`${CHIP} ${stageId === null ? CHIP_ON : CHIP_OFF}`}
              >
                <input
                  type="radio"
                  name="stageId"
                  value=""
                  checked={stageId === null}
                  onChange={() => chooseStage(null)}
                  className="sr-only"
                />
                {t("stage.none")}
              </label>
              {canAddStage && (
                <NewStageChip
                  tripId={trip.id}
                  number={trip.stages.length + 1}
                  point={point}
                  onCreated={chooseStage}
                />
              )}
            </div>
            {fields.stageId && (
              <p className={FIELD_ERROR}>{fieldError(fields.stageId)}</p>
            )}
          </fieldset>
        )}

        <div className="flex flex-col gap-1.5">
          <div
            className={`${CARD} flex flex-col gap-1 px-3.5 pt-2.5 pb-2 ${fields.note ? "border-danger" : ""}`}
          >
            <label
              htmlFor={ids.note}
              className="text-muted text-xs leading-[1.2] font-bold"
            >
              {t("note.label")} · {t("note.optional")}
            </label>
            <textarea
              id={ids.note}
              name="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={MAX_NOTE_LENGTH}
              rows={2}
              placeholder={t("note.placeholder")}
              aria-invalid={fields.note ? true : undefined}
              className="text-ink placeholder:text-muted/70 field-sizing-content min-h-12 w-full resize-none bg-transparent text-[14.5px] leading-[1.45] outline-none"
            />
          </div>
          {fields.note && (
            <p className={`${FIELD_ERROR} px-1`}>{fieldError(fields.note)}</p>
          )}
        </div>

        <PlaceRow
          source={source}
          pointKey={point ? point.join(",") : ""}
          handActive={handActive}
          onHand={startHand}
          onPhoto={(gps: GpsPoint) => place([gps.lon, gps.lat], "photo")}
          onRemove={() => {
            setPoint(null);
            setSource(null);
          }}
          serverError={fieldError(fields.place)}
        />

        {formError && (
          <p
            role="alert"
            className="bg-danger-soft text-danger rounded-xl px-3.5 py-2.5 text-[13px] leading-[1.4] font-bold"
          >
            {formError}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            disabled={!ready}
            aria-describedby={ready ? undefined : ids.need}
            className="focus-ring bg-pinhao text-cream disabled:hover:bg-pinhao flex h-14 cursor-pointer items-center justify-center gap-2.5 rounded-[18px] px-4 text-base font-extrabold shadow-[0_2px_4px_rgba(94,44,22,.18),0_10px_22px_rgba(142,74,42,.35)] transition-[background-color,box-shadow,opacity] hover:bg-[#7B3F23] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none aria-busy:cursor-wait"
            aria-busy={pending || undefined}
          >
            {pending ? (
              <SpinnerIcon className="size-5 animate-spin" />
            ) : (
              <SeedIcon className="size-5" strokeWidth={1.8} />
            )}
            <span className="truncate">
              {pending
                ? t("submit.pending")
                : stage
                  ? t("submit.inStage", { stage: stage.name })
                  : t("submit.plain")}
            </span>
          </button>
          {!ready && (
            <p
              id={ids.need}
              className="text-center text-xs leading-[1.3] font-semibold text-[#7A837C]"
            >
              {t("submit.needsName")}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

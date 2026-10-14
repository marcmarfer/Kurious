"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { AvatarStack } from "@/components/avatar";
import { AppIcon } from "@/components/growth-icon";
import { PlusIcon } from "@/components/icons";
import { WorkInProgress } from "@/components/work-in-progress";
import { AccountAvatarLink } from "@/features/auth/account-avatar";
import { TripMap, type TripMapHandle } from "@/features/map/trip-map";
import type { Trip } from "@/features/trips/types";
import { Link } from "@/i18n/navigation";
import { MoveControls, MoveNotice } from "@/features/map/move-notice";
import { useIdeaMoves } from "@/features/map/use-idea-moves";
import { DeletedNotice } from "./deleted-notice";
import { IdeaList } from "./idea-list";
import { KindChips } from "./kind-chips";
import {
  EmptyTrip,
  IdeaSummary,
  PickHint,
  StageSummary,
} from "./selection-card";
import {
  filterIdeas,
  initialSelection,
  kindCounts,
  rankIdeas,
  selectionAfterFilter,
  stageIdeas,
  type KindFilter,
} from "./selection";
import { useMapText } from "./use-map-text";
import { useWide } from "./use-wide";
import { ViewToggle, type ViewMode } from "./view-toggle";

const INSETS = {
  narrow: { top: 150, bottom: 280 },
  wide: { top: 120, bottom: 230 },
};

const ATTRIBUTION = "hidden lg:block right-6 bottom-3.5";

export function MapScreen({
  trip,
  requestedIdeaId,
  deletedIdeaId,
  now,
  myId,
}: {
  trip: Trip;
  requestedIdeaId: string | null;
  deletedIdeaId: string | null;
  now: number;
  myId: string;
}) {
  const t = useTranslations("MapScreen");
  const tt = useTranslations("Trip");
  const tm = useTranslations("Map3d");
  const text = useMapText(trip, now);
  const wide = useWide();
  const mapRef = useRef<TripMapHandle>(null);

  const [kind, setKind] = useState<KindFilter>("all");
  const [mode, setMode] = useState<ViewMode>("2d");
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    initialSelection(trip.ideas, requestedIdeaId),
  );
  const [requested, setRequested] = useState(requestedIdeaId);
  if (requested !== requestedIdeaId) {
    setRequested(requestedIdeaId);
    if (requestedIdeaId && trip.ideas.some((i) => i.id === requestedIdeaId)) {
      setSelectedId(requestedIdeaId);
      setKind("all");
    }
  }

  const ranked = useMemo(() => rankIdeas(trip.ideas), [trip.ideas]);
  const shown = useMemo(() => filterIdeas(ranked, kind), [ranked, kind]);
  const counts = useMemo(() => kindCounts(trip.ideas), [trip.ideas]);

  useEffect(() => {
    if (requestedIdeaId) mapRef.current?.select(requestedIdeaId);
  }, [requestedIdeaId]);

  const refit = useRef(false);
  useEffect(() => {
    if (!refit.current) return;
    refit.current = false;
    if (kind === "all") {
      mapRef.current?.fitTo(undefined, { animate: true });
      return;
    }
    const placed = shown
      .filter((idea) => idea.lon !== null)
      .map((idea) => idea.id);
    if (placed.length) mapRef.current?.fitTo(placed, { animate: true });
  }, [kind, shown]);

  const moves = useIdeaMoves(trip.id, trip.ideas);
  const movableIds = useMemo(
    () =>
      shown
        .filter(
          (idea) =>
            idea.shape?.type !== "LineString" &&
            idea.shape?.type !== "Polygon" &&
            (trip.myRole !== "guest" || idea.authorId === myId),
        )
        .map((idea) => idea.id),
    [shown, trip.myRole, myId],
  );
  const selectedIdea = shown.find((idea) => idea.id === selectedId) ?? null;
  const stageIndex = trip.stages.findIndex((stage) => stage.id === selectedId);
  const selectedStage = stageIndex >= 0 ? trip.stages[stageIndex] : null;
  const insets = wide ? INSETS.wide : INSETS.narrow;
  const focusIdeaId = trip.ideas.some(
    (idea) => idea.id === requestedIdeaId && idea.lon !== null,
  )
    ? requestedIdeaId
    : null;
  const hasIdeas = trip.ideas.length > 0;
  const plantHref = `/trips/${trip.id}/plant`;

  function selectFromList(id: string) {
    setSelectedId(id);
    mapRef.current?.select(id);
  }

  function changeKind(next: KindFilter) {
    setKind(next);
    refit.current = true;
    setSelectedId(
      selectionAfterFilter(selectedId, trip.ideas, trip.stages, next),
    );
  }

  function changeMode(next: ViewMode) {
    setMode(next);
    if (next === "2d" && selectedId) mapRef.current?.select(selectedId);
  }

  const range = text.dates(trip.startsOn, trip.endsOn);
  const people = tt("people", { count: trip.members.length });
  const stages = trip.stages.length
    ? tt("stages", { count: trip.stages.length })
    : null;
  const names = trip.members.map((member) => member.name);
  const membersLabel = tt("membersLabel", { names: names.join(", ") });

  function stageMeta(stageId: string) {
    const ideas = stageIdeas(trip.ideas, stageId);
    return t("stageIdeas", {
      count: ideas.length,
      top: ideas[0]?.title ?? "",
    });
  }

  const unplaced = shown.filter((idea) => idea.lon === null);
  const selection = selectedIdea ? (
    <IdeaSummary
      idea={selectedIdea}
      tripId={trip.id}
      label={text.label(selectedIdea)}
      meta={text.meta(selectedIdea)}
      points={text.points(selectedIdea)}
    />
  ) : selectedStage ? (
    <StageSummary
      stage={selectedStage}
      number={stageIndex + 1}
      tripId={trip.id}
      label={text.stageLabel(selectedStage, stageIndex + 1)}
      meta={stageMeta(selectedStage.id)}
    />
  ) : hasIdeas ? (
    unplaced.length > 0 ? (
      <PickHint tripId={trip.id} unplaced={unplaced} />
    ) : null
  ) : (
    <EmptyTrip tripId={trip.id} compact />
  );

  return (
    <div className="absolute inset-0 flex">
      <aside
        aria-label={t("panelLabel")}
        className="bg-cream border-line hidden min-h-0 w-[400px] shrink-0 flex-col border-r lg:flex"
      >
        <div className="border-line flex flex-col gap-3.5 border-b px-6 pt-6 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex min-w-0 grow flex-col gap-[3px]">
              <span className="text-pinhao text-xs leading-[1.2] font-bold">
                {tt("groupTrip")}
              </span>
              <h1 className="font-display text-ink line-clamp-2 text-[28px] leading-[1.1] font-semibold break-words">
                {trip.name}
              </h1>
              <span className="text-muted text-sm leading-[1.3]">
                {[range, stages, people].filter(Boolean).join(" · ")}
              </span>
            </div>
            <div className="mt-1">
              <AvatarStack
                names={names}
                colors={trip.members.map((member) => member.color)}
                label={membersLabel}
              />
            </div>
          </div>
          <Link
            href={plantHref}
            className="focus-ring bg-pinhao text-cream flex h-12 items-center justify-center gap-2 rounded-[15px] text-[15px] font-extrabold shadow-[0_2px_4px_rgba(94,44,22,.18),0_8px_18px_rgba(142,74,42,.28)] transition-[filter] hover:brightness-110"
          >
            <PlusIcon strokeWidth={2.4} />
            {t("plant")}
          </Link>
          {hasIdeas && (
            <KindChips
              kind={kind}
              counts={counts}
              onChange={changeKind}
              variant="panel"
            />
          )}
        </div>
        {hasIdeas ? (
          <>
            <div className="flex items-baseline justify-between px-6 pt-4 pb-2">
              <h2 className="font-display text-ink text-lg leading-[1.2] font-semibold">
                {t("listTitle")}
              </h2>
              <span className="text-muted text-[12.5px] font-semibold">
                {t("byVotes")}
              </span>
            </div>
            {shown.length > 0 ? (
              <IdeaList
                ideas={shown}
                selectedId={selectedId}
                onSelect={selectFromList}
                pointsText={text.points}
                bylineText={text.byline}
              />
            ) : (
              <p className="text-muted px-6 pt-2 text-sm">{t("emptyFilter")}</p>
            )}
          </>
        ) : (
          <EmptyTrip tripId={trip.id} />
        )}
      </aside>

      <div className="relative min-w-0 flex-1 overflow-hidden">
        <TripMap
          ref={mapRef}
          stages={trip.stages}
          ideas={moves.apply(shown)}
          movableIds={movableIds}
          onMove={moves.move}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDeselect={() => setSelectedId(null)}
          focusIdeaId={focusIdeaId}
          insets={insets}
          className={`absolute inset-0 isolate ${mode === "3d" ? "invisible" : ""}`}
          attributionClassName={ATTRIBUTION}
        />
        {mode === "3d" && (
          <WorkInProgress
            feature="globe"
            onBack={() => changeMode("2d")}
            className="absolute inset-0 isolate"
          />
        )}

        <header className="bg-cream/90 absolute inset-x-4 top-[calc(env(safe-area-inset-top)+16px)] flex h-[52px] items-center gap-2.5 rounded-[18px] border border-white/60 pr-2.5 pl-2 shadow-[0_1px_2px_rgba(31,42,36,.1),0_10px_26px_rgba(31,42,36,.2)] backdrop-blur-[16px] backdrop-saturate-[1.3] lg:hidden">
          <AppIcon className="size-9" px={36} />
          <div className="flex min-w-0 grow flex-col gap-px">
            <h1 className="font-display text-ink truncate text-[17px] leading-[1.1] font-semibold">
              {trip.name}
            </h1>
            <span className="text-muted truncate text-[11.5px] leading-[1.2]">
              {[range, people].filter(Boolean).join(" · ")}
            </span>
          </div>
          <AccountAvatarLink />
        </header>
        {hasIdeas && (
          <KindChips
            kind={kind}
            counts={counts}
            onChange={changeKind}
            variant="floating"
            className="absolute inset-x-0 top-[calc(env(safe-area-inset-top)+80px)] lg:hidden"
          />
        )}

        <ViewToggle
          mode={mode}
          onChange={changeMode}
          className="absolute top-6 right-6 hidden lg:flex"
        />
        <MoveNotice notice={moves.notice} onDismiss={moves.dismiss} />
        {mode === "2d" && (
          <MoveControls
            canUndo={moves.canUndo}
            canRedo={moves.canRedo}
            onUndo={moves.undo}
            onRedo={moves.redo}
            className="top-[calc(env(safe-area-inset-top)+128px)] right-4 lg:top-[84px] lg:right-6"
          />
        )}
        {deletedIdeaId && (
          <DeletedNotice
            key={deletedIdeaId}
            tripId={trip.id}
            ideaId={deletedIdeaId}
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col lg:static">
          <div className="flex h-14 items-center justify-between px-4 lg:hidden">
            <ViewToggle
              mode={mode}
              onChange={changeMode}
              className="pointer-events-auto"
            />
            <Link
              href={plantHref}
              aria-label={t("plant")}
              className="focus-ring bg-pinhao text-cream pointer-events-auto flex size-14 items-center justify-center rounded-full shadow-[0_2px_4px_rgba(31,20,12,.25),0_10px_22px_rgba(142,74,42,.45)]"
            >
              <PlusIcon strokeWidth={2.4} className="size-[26px]" />
            </Link>
          </div>
          <div className="relative h-4 lg:hidden">
            {mode === "2d" && (
              <span className="text-ink/72 absolute -top-px left-[18px] text-[9.5px] leading-none font-semibold [text-shadow:0_0_3px_rgba(252,251,246,.9)]">
                {tm("attribution2d")}
              </span>
            )}
          </div>
          <section
            aria-label={t("selection")}
            aria-live="polite"
            className={`bg-cream/97 pointer-events-auto flex min-h-[200px] flex-col gap-3 rounded-t-[24px] px-4 pt-2 pb-3.5 shadow-[0_-2px_6px_rgba(31,42,36,.1),0_-12px_32px_rgba(31,42,36,.22)] lg:absolute lg:bottom-6 lg:left-6 lg:min-h-0 lg:w-[440px] lg:gap-3.5 lg:rounded-[22px] lg:border lg:border-white/70 lg:p-[18px] lg:pb-4 lg:shadow-[0_2px_6px_rgba(31,42,36,.1),0_16px_40px_rgba(31,42,36,.26)] ${selection === null ? "hidden" : hasIdeas || selectedStage ? "" : "lg:hidden"}`}
          >
            <div className="bg-stone h-1 w-9 shrink-0 self-center rounded-full lg:hidden" />
            {selection}
          </section>
        </div>
      </div>
    </div>
  );
}

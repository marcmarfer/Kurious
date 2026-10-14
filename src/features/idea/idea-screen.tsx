"use client";

import { useTranslations } from "next-intl";
import { useCallback, useOptimistic, useRef, useState } from "react";
import { Avatar } from "@/components/avatar";
import { Collapse } from "@/components/collapse";
import { LinkIcon, PencilIcon } from "@/components/icons";
import { kindInkClass } from "@/components/kind-label";
import { VoteButtons } from "@/components/vote-buttons";
import type { TripMapHandle } from "@/features/map/trip-map";
import type { LngLat } from "@/features/map/trip-markers";
import type { FoundPlace } from "@/features/plant/google-places";
import { PlaceSearch } from "@/features/plant/place-search";
import { MoveControls, MoveNotice } from "@/features/map/move-notice";
import { useIdeaMoves } from "@/features/map/use-idea-moves";
import {
  applyVote,
  points,
  rawScore,
  stageOf,
  type VoteState,
} from "@/features/trips/growth";
import { formatTimeAgo } from "@/features/trips/time";
import type { Comment, Idea, Trip, VoteValue } from "@/features/trips/types";
import { GrowthCard } from "./growth-card";
import { CommentComposer, IdeaComments } from "./idea-comments";
import { liveGrowth, pointsToGrow, sourceHost } from "./idea-growth";
import { IdeaEditForm } from "./idea-edit-form";
import { IdeaMap } from "./idea-map";
import { PlaceBar } from "./place-bar";

export function IdeaScreen({
  trip,
  idea,
  comments,
  rival,
  now,
  canDelete,
  canModerate,
  myId,
}: {
  trip: Trip;
  idea: Idea;
  comments: Comment[];
  rival: number | null;
  now: number;
  canDelete: boolean;
  canModerate: boolean;
  myId: string;
}) {
  const t = useTranslations("Idea");
  const tk = useTranslations("Kinds");
  const time = useTranslations("Time");
  const te = useTranslations("IdeaEdit");
  const [votes, applyLocal] = useOptimistic<VoteState, VoteValue>(
    { fire: idea.fire, up: idea.up, down: idea.down, myVote: idea.myVote },
    applyVote,
  );

  const growth = liveGrowth(votes, idea, rival);
  const hot = growth === "fire";
  const stage = stageOf(trip, idea);
  const author = idea.authorName || t("someone");
  const ago = formatTimeAgo(
    (key, values) => time(key as Parameters<typeof time>[0], values),
    idea.createdAt,
    now,
  );
  const host = sourceHost(idea.sourceUrl);
  const colorOf = (id: string | null) =>
    trip.members.find((member) => member.id === id)?.color ?? null;
  const [editing, setEditing] = useState(false);
  const [editRound, setEditRound] = useState(0);
  const stopEditing = useCallback(() => setEditing(false), []);

  const mapRef = useRef<TripMapHandle>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [placing, setPlacing] = useState(false);
  const [searchShown, setSearchShown] = useState(false);
  const [draft, setDraft] = useState<LngLat | null>(null);
  const moves = useIdeaMoves(trip.id, trip.ideas);
  const ideas = moves.apply(trip.ideas);
  const shownIdea = ideas.find((item) => item.id === idea.id) ?? idea;
  const hasPlace = shownIdea.lon !== null && shownIdea.lat !== null;
  const movable =
    canDelete &&
    idea.shape?.type !== "LineString" &&
    idea.shape?.type !== "Polygon";
  const placedIdeas = trip.ideas.filter(
    (other) => other.lon !== null && other.lat !== null,
  );
  const searchNear = hasPlace
    ? { lat: idea.lat!, lng: idea.lon! }
    : placedIdeas.length
      ? {
          lat:
            placedIdeas.reduce((sum, other) => sum + (other.lat ?? 0), 0) /
            placedIdeas.length,
          lng:
            placedIdeas.reduce((sum, other) => sum + (other.lon ?? 0), 0) /
            placedIdeas.length,
        }
      : null;

  function startPlacing() {
    setEditing(false);
    setDraft(null);
    setSearchShown(true);
    setPlacing(true);
    scroller.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToFound(found: FoundPlace) {
    if (found.bounds) mapRef.current?.flyToBounds(found.bounds, 16);
    else mapRef.current?.flyTo([found.lon, found.lat], 16);
    scroller.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function savePlace() {
    if (!draft) return;
    moves.move(idea.id, draft);
    setPlacing(false);
    setDraft(null);
  }

  return (
    <div
      ref={scroller}
      className="bg-cream relative flex min-h-0 flex-1 flex-col overflow-y-auto lg:grid lg:grid-cols-[minmax(0,1fr)_520px] lg:grid-rows-1 lg:overflow-hidden"
    >
      <IdeaMap
        trip={trip}
        idea={shownIdea}
        hot={hot}
        ideas={ideas}
        movable={movable}
        onMove={moves.move}
        notice={
          <>
            <MoveNotice
              notice={moves.notice}
              onDismiss={moves.dismiss}
              className="top-[calc(env(safe-area-inset-top)+68px)] lg:top-6"
            />
            <MoveControls
              canUndo={moves.canUndo}
              canRedo={moves.canRedo}
              onUndo={moves.undo}
              onRedo={moves.redo}
              className="top-[calc(env(safe-area-inset-top)+16px)] right-4 lg:top-6 lg:right-6"
            />
          </>
        }
        mapRef={mapRef}
        draft={placing ? draft : null}
        onDraft={placing ? setDraft : undefined}
        onPlace={movable && !hasPlace ? startPlacing : undefined}
        placing={
          placing && (
            <PlaceBar
              ready={draft !== null}
              pending={false}
              onSave={savePlace}
              onCancel={() => {
                setPlacing(false);
                setDraft(null);
              }}
            />
          )
        }
      />
      <article
        aria-labelledby="idea-title"
        className="bg-cream lg:border-line relative -mt-[26px] flex grow flex-col gap-4 rounded-t-[26px] px-5 pt-[22px] pb-[calc(env(safe-area-inset-bottom)+24px)] shadow-[0_-10px_30px_rgba(10,20,15,.2)] lg:mt-0 lg:min-h-0 lg:gap-[18px] lg:overflow-y-auto lg:rounded-none lg:border-l lg:px-8 lg:pt-8 lg:pb-7 lg:shadow-none"
      >
        <Collapse open={placing}>
          {searchShown && (
            <PlaceSearch
              near={searchNear}
              placed={draft !== null}
              onPick={goToFound}
            />
          )}
        </Collapse>
        <header className="flex flex-col gap-2">
          <div className="flex min-h-5 items-center justify-between gap-2">
            <p
              className={`text-xs leading-[1.2] font-bold ${hot ? "text-fire" : kindInkClass(idea.kind)}`}
            >
              {[tk(idea.kind), stage?.name].filter(Boolean).join(" · ")}
            </p>
            {canDelete && !editing && (
              <button
                type="button"
                aria-label={te("action")}
                title={te("action")}
                onClick={() => {
                  setPlacing(false);
                  setDraft(null);
                  setEditRound((round) => round + 1);
                  setEditing(true);
                }}
                className="text-muted hover:text-ink hover:bg-fog focus-ring -my-2.5 -mr-2 flex size-10 cursor-pointer items-center justify-center rounded-full"
              >
                <PencilIcon className="size-5" />
              </button>
            )}
          </div>
          <div>
            <Collapse open={editing}>
              <IdeaEditForm
                key={editRound}
                idea={idea}
                stages={trip.stages}
                onDone={stopEditing}
              />
            </Collapse>
            <Collapse open={!editing}>
              <h1
                id="idea-title"
                className="font-display text-ink text-[26px] leading-[1.15] font-semibold [overflow-wrap:anywhere] lg:text-[32px]"
              >
                {idea.title}
              </h1>
            </Collapse>
          </div>
          <p className="flex items-center gap-2">
            <Avatar
              name={author}
              color={colorOf(idea.authorId)}
              className="size-[26px] text-[11px]"
            />
            <span className="text-muted text-[13px] leading-[1.2] font-semibold">
              {author} · <time dateTime={idea.createdAt}>{ago}</time>
            </span>
          </p>
        </header>

        <GrowthCard
          growth={growth}
          points={points(votes)}
          text={t(`growthText.${growth}`, {
            ago,
            missing: pointsToGrow(growth, rawScore(votes), idea.members) ?? 0,
          })}
        />

        <div className="flex items-center gap-2">
          <VoteButtons
            tripId={trip.id}
            ideaId={idea.id}
            fire={idea.fire}
            up={idea.up}
            down={idea.down}
            myVote={idea.myVote}
            size="hero"
            onVote={applyLocal}
          />
          <p className="text-muted ml-auto text-right text-[12.5px] leading-[1.3] font-semibold">
            {t(`voteNote.${votes.myVote ?? "none"}`)}
          </p>
        </div>

        {idea.note && (
          <Collapse open={!editing}>
            <p className="text-[15px] leading-[1.55] break-words whitespace-pre-line text-[#2B3530]">
              {idea.note}
            </p>
          </Collapse>
        )}

        {host && idea.sourceUrl && (
          <a
            href={idea.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("sourceLabel", { host })}
            className="focus-ring bg-frost text-forest-dark hover:text-moss -mt-1 flex h-8 max-w-full items-center gap-1.5 self-start rounded-full pr-3 pl-2.5 text-[13px] font-extrabold transition-colors"
          >
            <LinkIcon className="size-4 shrink-0" strokeWidth={2.2} />
            <span className="truncate">{host}</span>
          </a>
        )}

        <IdeaComments
          tripId={trip.id}
          comments={comments}
          now={now}
          colorOf={colorOf}
          canDelete={(comment) =>
            canModerate ||
            (comment.authorId !== null && comment.authorId === myId)
          }
        />
        <CommentComposer tripId={trip.id} ideaId={idea.id} />

        <p className="text-[10.5px] leading-[1.45] font-semibold text-[#8A938C]">
          {t("attribution")}
        </p>
      </article>
    </div>
  );
}

import type { Metadata } from "next";
import { getFormatter, getNow, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { GrowthIcon } from "@/components/growth-icon";
import { ChevronRightIcon, PlusIcon } from "@/components/icons";
import { AccountAvatarLink } from "@/features/auth/account-avatar";
import { rivalScore } from "@/features/idea/idea-growth";
import {
  UNASSIGNED,
  groupWinner,
  openStageId,
  planGroups,
  rankIdeas,
  voteProgress,
  type StageGroup,
} from "@/features/stages/plan-board";
import { PlanIdeaRow, PlanLeader } from "@/features/stages/plan-ideas";
import {
  PlanViews,
  TripProgress,
  TripRanking,
} from "@/features/stages/plan-summary";
import { SortableStages } from "@/features/stages/sortable-stages";
import { StageCard } from "@/features/stages/stage-card";
import { StageGrip } from "@/features/stages/stage-row-actions";
import { StageSuggestion } from "@/features/stages/stage-suggestion";
import { getTrip } from "@/features/trips/queries";
import { stageHex } from "@/features/trips/stage-colors";
import { suggestStages } from "@/features/trips/stage-match";
import { DAY_MONTH, dayCount, parseDay } from "@/features/trips/time";
import type { Idea } from "@/features/trips/types";
import { Link } from "@/i18n/navigation";

const UNASSIGNED_HEX = "#5F6B63";
const RANKING_SHOWN = 5;
const RANKING_SHOWN_WIDE = 6;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Plan");
  return { title: t("title") };
}

export default async function PlanPage({
  params,
}: PageProps<"/[locale]/trips/[tripId]/plan">) {
  const { tripId } = await params;
  const trip = await getTrip(tripId);
  if (!trip) notFound();

  const canManage = trip.myRole !== "guest";
  const t = await getTranslations("Plan");
  const ts = await getTranslations("Stages");
  const tt = await getTranslations("Trip");
  const time = await getTranslations("Time");
  const format = await getFormatter();
  const today = (await getNow()).toISOString().slice(0, 10);

  const range = (start: string | null, end: string | null) => {
    if (!start) return t("noDates");
    const last = end ?? start;
    const dates = format.dateTimeRange(
      parseDay(start),
      parseDay(last),
      DAY_MONTH,
    );
    return `${dates} · ${time("days", { count: dayCount(start, last) ?? 1 })}`;
  };

  const groups = planGroups(trip.stages, trip.ideas);
  const stageGroups = groups.filter((group) => group.stage);
  const unassigned = groups.find((group) => group.key === UNASSIGNED);
  const openId = openStageId(trip.stages, today);
  const suggestions = canManage
    ? suggestStages(unassigned?.ideas ?? [], trip.stages)
    : [];
  const progress = voteProgress(trip.ideas);
  const rival = (idea: Idea) => rivalScore(trip.ideas, idea.id);

  const lookOf = (group: StageGroup) => {
    const index = trip.stages.findIndex((stage) => stage.id === group.key);
    return group.stage
      ? { name: group.stage.name, hex: stageHex(group.stage, index) }
      : { name: t("unassignedTitle"), hex: UNASSIGNED_HEX };
  };
  const lookOfIdea = (idea: Idea) =>
    lookOf(
      groups.find((group) => group.ideas.some((item) => item.id === idea.id))!,
    );

  const card = (group: StageGroup) => {
    const look = lookOf(group);
    const winner = groupWinner(group);
    const rest = winner ? group.ideas.slice(1) : group.ideas;
    const suggestion = suggestions.find((item) => item.stage.id === group.key);
    const stage = group.stage;

    return (
      <StageCard
        name={look.name}
        hex={look.hex}
        numbered={stage !== null}
        subline={
          stage
            ? `${range(stage.startsOn, stage.endsOn)}${stage.lon === null ? ` · ${ts("noPlace")}` : ""}`
            : trip.stages.length > 0
              ? t("unassignedSubline")
              : t("unassignedHintNoStages")
        }
        foldedSubline={winner ? t("wins", { title: winner.title }) : null}
        pending={group.pending}
        total={group.ideas.length}
        open={stage ? stage.id === openId : trip.stages.length === 0}
        grip={
          stage && canManage && trip.stages.length > 1 ? (
            <StageGrip tripId={trip.id} stageId={stage.id} name={stage.name} />
          ) : null
        }
        editHref={
          stage && canManage ? `/trips/${trip.id}/stages/${stage.id}` : null
        }
        leader={
          winner && (
            <PlanLeader
              tripId={trip.id}
              idea={winner}
              rival={rival(winner)}
              stageName={stage ? look.name : null}
              hex={look.hex}
            />
          )
        }
        rows={rest.map((idea, i) => (
          <PlanIdeaRow
            key={idea.id}
            tripId={trip.id}
            idea={idea}
            rival={rival(idea)}
            rank={i + (winner ? 2 : 1)}
          />
        ))}
        footer={
          <>
            {stage && group.ideas.length === 0 && (
              <p className="text-muted px-4 py-3.5 text-[13.5px]">
                {t("stageEmpty")}{" "}
                <Link
                  href={`/trips/${trip.id}/plant?stage=${stage.id}`}
                  className="text-forest-dark focus-ring rounded font-extrabold underline decoration-2 underline-offset-4"
                >
                  {t("plantHere")}
                </Link>
              </p>
            )}
            {stage && suggestion && (
              <div className="px-3 pb-3">
                <StageSuggestion
                  tripId={trip.id}
                  stageId={stage.id}
                  stageName={stage.name}
                  ideas={suggestion.ideas.map((idea) => ({
                    id: idea.id,
                    title: idea.title,
                  }))}
                />
              </div>
            )}
          </>
        }
      />
    );
  };

  const ranked = rankIdeas(trip.ideas);
  const rankingRows = (compact: boolean) =>
    ranked.map((idea, i) => {
      const look = lookOfIdea(idea);
      return (
        <PlanIdeaRow
          key={idea.id}
          tripId={trip.id}
          idea={idea}
          rival={rival(idea)}
          rank={i + 1}
          stage={{ name: look.name, hex: look.hex }}
          podium={i < 3}
          compact={compact}
        />
      );
    });
  const plantHref = `/trips/${trip.id}/plant`;
  const hasIdeas = trip.ideas.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-[1160px] items-start gap-8 px-4 pt-8 pb-10 lg:px-10 lg:pt-12">
      <div className="flex min-w-0 grow flex-col gap-5 lg:max-w-[700px]">
        <header className="flex items-start gap-3">
          <div className="flex min-w-0 grow flex-col gap-1">
            <span className="text-pinhao truncate text-xs font-bold">
              {trip.name}
            </span>
            <h1 className="font-display text-ink text-[28px] leading-tight font-semibold">
              {t("title")}
            </h1>
            <p className="text-muted text-sm">
              {range(trip.startsOn, trip.endsOn)} ·{" "}
              {tt("stages", { count: trip.stages.length })} ·{" "}
              {tt("ideas", { count: trip.ideas.length })}
            </p>
          </div>
          <Link
            href={plantHref}
            aria-label={t("plant")}
            className="focus-ring bg-pinhao text-cream flex h-10 shrink-0 items-center gap-1.5 rounded-[14px] pr-3.5 pl-3 text-sm font-extrabold shadow-[0_4px_12px_rgba(142,74,42,.3)]"
          >
            <PlusIcon strokeWidth={2.4} className="size-[18px]" />
            <span className="hidden sm:inline">{t("plant")}</span>
          </Link>
          <AccountAvatarLink />
        </header>

        {hasIdeas && (
          <div className="lg:hidden">
            <TripProgress done={progress.done} total={progress.total} />
          </div>
        )}

        <PlanViews
          byStage={
            <section
              aria-label={t("stagesTitle")}
              className="flex flex-col gap-4"
            >
              {trip.stages.length === 0 && canManage && (
                <p className="border-line bg-cream/80 text-muted rounded-[22px] border border-dashed px-5 py-5 text-center text-sm leading-relaxed">
                  {ts("empty")}
                </p>
              )}
              {stageGroups.length > 0 && (
                <SortableStages
                  key={trip.stages.map((stage) => stage.id).join()}
                  tripId={trip.id}
                  sortable={canManage && trip.stages.length > 1}
                  items={stageGroups.map((group) => ({
                    id: group.key,
                    node: card(group),
                  }))}
                />
              )}
              {unassigned && (
                <div className="bg-cream flex flex-col overflow-hidden rounded-[22px]">
                  {card(unassigned)}
                </div>
              )}
              {canManage && (
                <Link
                  href={`/trips/${trip.id}/stages/new`}
                  className="focus-ring border-stone text-forest-dark bg-cream hover:border-forest-dark flex h-11 items-center gap-1.5 self-start rounded-[14px] border-[1.5px] pr-4 pl-3 text-sm font-extrabold"
                >
                  <PlusIcon strokeWidth={2.4} className="size-[18px]" />
                  {ts("add")}
                </Link>
              )}
            </section>
          }
          byTrip={
            <TripRanking rows={rankingRows(false)} shown={RANKING_SHOWN} />
          }
        />

        {!hasIdeas && (
          <section className="bg-cream border-line shadow-card flex flex-col items-center gap-3 rounded-[22px] border px-6 py-8 text-center">
            <GrowthIcon growth="sprout" className="h-16 w-12" />
            <h2 className="font-display text-ink text-xl font-semibold">
              {t("emptyTitle")}
            </h2>
            <p className="text-muted max-w-sm text-sm leading-relaxed">
              {t("emptyBody")}
            </p>
            <Link
              href={`/trips/${trip.id}`}
              className="bg-forest-dark text-cream focus-ring mt-2 flex h-11 items-center gap-0.5 rounded-[14px] pr-2.5 pl-4 text-sm font-extrabold"
            >
              {t("toMap")}
              <ChevronRightIcon className="size-[18px]" />
            </Link>
          </section>
        )}
      </div>

      {hasIdeas && (
        <aside
          aria-label={t("summaryLabel")}
          className="sticky top-12 hidden w-[380px] shrink-0 flex-col gap-6 lg:flex"
        >
          <TripProgress done={progress.done} total={progress.total} />
          <TripRanking rows={rankingRows(true)} shown={RANKING_SHOWN_WIDE} />
        </aside>
      )}
    </div>
  );
}

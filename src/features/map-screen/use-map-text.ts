import { useFormatter, useTranslations } from "next-intl";
import { isSeed, points, stageOf } from "@/features/trips/growth";
import {
  DAY_MONTH,
  dayCount,
  formatTimeAgo,
  parseDay,
} from "@/features/trips/time";
import type { Idea, Stage, Trip } from "@/features/trips/types";

export function useMapText(trip: Pick<Trip, "stages">, now: number) {
  const t = useTranslations("MapScreen");
  const tk = useTranslations("Kinds");
  const tt = useTranslations("Trip");
  const time = useTranslations("Time");
  const format = useFormatter();

  const author = (idea: Idea) => idea.authorName || t("someone");
  const ago = (idea: Idea) =>
    formatTimeAgo(
      (key, values) => time(key as Parameters<typeof time>[0], values),
      idea.createdAt,
      now,
    );

  const dates = (startsOn: string | null, endsOn: string | null) =>
    startsOn
      ? format.dateTimeRange(
          parseDay(startsOn),
          parseDay(endsOn ?? startsOn),
          DAY_MONTH,
        )
      : null;

  const length = (meters: number) =>
    format.number(meters / 1000, {
      style: "unit",
      unit: "kilometer",
      maximumFractionDigits: meters < 10_000 ? 1 : 0,
    });

  return {
    dates,
    points: (idea: Idea) => tt("points", { count: points(idea) }),
    label(idea: Idea) {
      const parts = [tk(idea.kind)];
      if (idea.kind === "route" && idea.lengthM)
        parts.push(length(idea.lengthM));
      const stage = stageOf(trip, idea);
      if (idea.growth === "fire") parts.push(t("topVoted"));
      else if (isSeed(idea)) parts.push(t("noVotes"));
      else if (stage) parts.push(stage.name);
      return parts.join(" · ");
    },
    meta(idea: Idea) {
      const extra =
        idea.commentCount > 0
          ? tt("comments", { count: idea.commentCount })
          : isSeed(idea)
            ? t("voteToPlant")
            : t("noComments");
      return [author(idea), ago(idea), extra].join(" · ");
    },
    byline: (idea: Idea) =>
      [tk(idea.kind), author(idea), ago(idea)].join(" · "),
    stageLabel(stage: Stage, number: number) {
      const parts = [tt("stageNumber", { number })];
      const range = dates(stage.startsOn, stage.endsOn);
      if (range) {
        parts.push(range);
        parts.push(
          time("days", {
            count:
              dayCount(stage.startsOn, stage.endsOn ?? stage.startsOn) ?? 1,
          }),
        );
      }
      return parts.join(" · ");
    },
  };
}

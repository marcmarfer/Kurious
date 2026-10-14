import { getFormatter, getTranslations } from "next-intl/server";
import { ChevronRightIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import type { MyTrip } from "./queries";
import { parseDay } from "./time";
import { GrowthIcon } from "@/components/growth-icon";

const DATE = {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
} as const;

export async function TripCard({
  trip,
  editable,
  current,
}: {
  trip: MyTrip;
  editable: boolean;
  current: boolean;
}) {
  const t = await getTranslations("Trips");
  const format = await getFormatter();
  const dates = trip.startsOn
    ? format.dateTimeRange(
        parseDay(trip.startsOn),
        parseDay(trip.endsOn ?? trip.startsOn),
        DATE,
      )
    : t("noDates");
  const canEdit = editable && trip.myRole !== "guest";

  return (
    <li
      className={`bg-cream shadow-card relative flex items-center gap-3 rounded-[22px] border px-5 py-4 ${current ? "border-forest-dark" : "border-line"}`}
    >
      {current && (
        <>
          <GrowthIcon growth="araucaria" className="h-11 w-[33px]" />
          <span className="sr-only">{t("current")}</span>
        </>
      )}
      <div className="flex min-w-0 grow flex-col gap-1">
        <Link
          href={`/trips/${trip.id}`}
          className="font-display text-ink focus-ring truncate rounded-md text-xl leading-tight font-semibold after:absolute after:inset-0 after:rounded-[22px]"
        >
          {trip.name}
        </Link>
        <span className="text-muted truncate text-sm">
          {dates} · {t(`role.${trip.myRole}`)}
        </span>
      </div>
      {canEdit && (
        <Link
          href={`/trips/${trip.id}/edit`}
          aria-label={t("editLabel", { name: trip.name })}
          className="border-line text-forest-dark hover:border-forest-dark focus-ring relative z-10 flex h-10 shrink-0 items-center rounded-full border bg-white px-4 text-sm font-bold"
        >
          {t("edit")}
        </Link>
      )}
      <ChevronRightIcon className="text-muted size-5 shrink-0" />
    </li>
  );
}

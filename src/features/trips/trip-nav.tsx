"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
  CalendarIcon,
  GroupIcon,
  MapIcon,
  SuitcaseIcon,
} from "@/components/icons";
import { Link, usePathname } from "@/i18n/navigation";

const NO_TRIP_PATH = "/start";

const TABS = [
  { key: "map", path: "", Icon: MapIcon },
  { key: "plan", path: "/plan", Icon: CalendarIcon },
  { key: "group", path: "/group", Icon: GroupIcon },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function activeTab(pathname: string, base: string): TabKey | null {
  if (pathname !== base && !pathname.startsWith(`${base}/`)) return null;
  const rest = pathname.slice(base.length);
  const match = TABS.find(
    (tab) => tab.path && (rest === tab.path || rest.startsWith(`${tab.path}/`)),
  );
  return match?.key ?? "map";
}

const STYLES = {
  rail: {
    list: "flex w-full flex-col gap-1",
    item: "focus-ring flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm transition-colors group-data-compact/rail:justify-center group-data-compact/rail:px-0",
    on: "bg-cream/14 text-cream font-extrabold",
    off: "text-mist font-bold hover:bg-cream/8 hover:text-cream",
    label: "group-data-compact/rail:sr-only",
  },
  bar: {
    list: "grid h-16 auto-cols-fr grid-flow-col items-center",
    item: "focus-ring flex h-[63px] flex-col items-center justify-center gap-[3px] text-[11px]",
    on: "text-forest-dark font-extrabold",
    off: "text-muted font-semibold hover:text-forest-dark",
    label: "",
  },
};

export function RailFrame({
  tripId,
  label,
  children,
}: {
  tripId?: string;
  label: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const compact =
    tripId !== undefined && activeTab(pathname, `/trips/${tripId}`) === "map";

  return (
    <nav
      aria-label={label}
      data-compact={compact || undefined}
      className="group/rail bg-forest-dark hidden w-[212px] shrink-0 flex-col gap-1 px-4 pt-5 pb-[18px] transition-[width] duration-200 data-compact:w-[76px] lg:flex"
    >
      {children}
    </nav>
  );
}

export function TripsLink({ variant }: { variant: keyof typeof STYLES }) {
  const t = useTranslations("Nav");
  const on = usePathname() === "/trips";
  const s = STYLES[variant];

  return (
    <Link
      href="/trips"
      aria-current={on ? "page" : undefined}
      className={`${s.item} ${on ? s.on : s.off}`}
    >
      <SuitcaseIcon className="size-[22px] shrink-0" />
      <span className={s.label}>{t("tripsTab")}</span>
    </Link>
  );
}

export function TripNav({
  tripId,
  variant,
  withTrips = false,
}: {
  tripId?: string;
  variant: keyof typeof STYLES;
  withTrips?: boolean;
}) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const base = tripId ? `/trips/${tripId}` : NO_TRIP_PATH;
  const active = activeTab(pathname, base);
  const s = STYLES[variant];

  return (
    <ul className={s.list}>
      {TABS.map(({ key, path, Icon }) => {
        const on = key === active;
        return (
          <li key={key} className="contents">
            <Link
              href={`${base}${path}`}
              aria-current={on ? "page" : undefined}
              className={`${s.item} ${on ? s.on : s.off}`}
            >
              <Icon className="size-[22px] shrink-0" />
              <span className={s.label}>{t(key)}</span>
            </Link>
          </li>
        );
      })}
      {withTrips && (
        <li className="contents">
          <TripsLink variant={variant} />
        </li>
      )}
    </ul>
  );
}

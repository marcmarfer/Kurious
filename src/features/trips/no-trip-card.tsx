import { getTranslations } from "next-intl/server";
import { GrowthIcon } from "@/components/growth-icon";
import { PlusIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";

export async function NoTripCard({
  tab,
  className = "",
}: {
  tab: "map" | "plan" | "group";
  className?: string;
}) {
  const t = await getTranslations("NoTrip");

  return (
    <section
      className={`bg-cream border-line shadow-card flex flex-col items-center gap-3 rounded-[22px] border px-6 py-8 text-center ${className}`}
    >
      <GrowthIcon growth="seed" className="h-16 w-12" />
      <h2 className="font-display text-ink text-xl font-semibold">
        {t(`${tab}.title`)}
      </h2>
      <p className="text-muted max-w-sm text-sm leading-relaxed">
        {t(`${tab}.body`)}
      </p>
      <Link
        href="/trips/new"
        className="focus-ring bg-pinhao text-cream mt-2 flex h-11 items-center gap-1.5 rounded-[14px] pr-4 pl-3 text-sm font-extrabold"
      >
        <PlusIcon strokeWidth={2.4} className="size-[18px]" />
        {t("action")}
      </Link>
    </section>
  );
}

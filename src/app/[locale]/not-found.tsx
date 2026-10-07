import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFoundPage() {
  const t = useTranslations("NotFound");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-display text-forest-dark text-3xl font-semibold">
        {t("title")}
      </h1>
      <Link
        href="/"
        className="bg-forest-dark text-cream rounded-xl px-4 py-2 font-bold"
      >
        {t("back")}
      </Link>
    </main>
  );
}

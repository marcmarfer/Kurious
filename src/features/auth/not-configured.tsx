import { getTranslations } from "next-intl/server";

export async function NotConfigured() {
  const t = await getTranslations("Auth");
  return (
    <p className="border-line text-muted mb-5 rounded-2xl border border-dashed bg-white/60 px-4 py-3 text-sm">
      {t("notConfigured")}
    </p>
  );
}

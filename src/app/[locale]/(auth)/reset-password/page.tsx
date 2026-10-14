import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { CardHeading } from "@/features/auth/auth-card";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";
import { getCurrentUser } from "@/features/auth/session";
import { redirect } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth");
  return { title: t("resetTitle") };
}

export default async function ResetPasswordPage() {
  if (!(await getCurrentUser())) {
    redirect({
      href: { pathname: "/forgot-password", query: { error: "link" } },
      locale: await getLocale(),
    });
  }
  const t = await getTranslations("Auth");

  return (
    <>
      <CardHeading title={t("resetTitle")} subtitle={t("resetSubtitle")} />
      <ResetPasswordForm />
    </>
  );
}

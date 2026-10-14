import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { CardFooter, CardHeading } from "@/features/auth/auth-card";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";
import { NotConfigured } from "@/features/auth/not-configured";
import { getCurrentUser } from "@/features/auth/session";
import { Link, redirect } from "@/i18n/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth");
  return { title: t("forgotTitle") };
}

export default async function ForgotPasswordPage({
  searchParams,
}: PageProps<"/[locale]/forgot-password">) {
  const { error } = await searchParams;
  if (await getCurrentUser()) {
    redirect({ href: "/", locale: await getLocale() });
  }
  const t = await getTranslations("Auth");

  return (
    <>
      <ForgotPasswordForm
        initialError={error === "link" ? "resetLinkInvalid" : undefined}
        disabled={!hasSupabaseEnv}
        heading={
          <CardHeading
            title={t("forgotTitle")}
            subtitle={t("forgotSubtitle")}
            notice={!hasSupabaseEnv && <NotConfigured />}
          />
        }
      />
      <CardFooter>
        <Link
          href="/login"
          className="text-forest-dark font-bold underline decoration-2 underline-offset-4"
        >
          {t("backToLogin")}
        </Link>
      </CardFooter>
    </>
  );
}

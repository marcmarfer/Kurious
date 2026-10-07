import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { CardFooter, CardHeading } from "@/features/auth/auth-card";
import { LoginForm } from "@/features/auth/login-form";
import { NotConfigured } from "@/features/auth/not-configured";
import { getCurrentUser } from "@/features/auth/session";
import { safeNextPath } from "@/features/auth/validation";
import { Link, redirect } from "@/i18n/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth");
  return { title: t("tabLogin") };
}

export default async function LoginPage({
  searchParams,
}: PageProps<"/[locale]/login">) {
  const { next, error } = await searchParams;
  const nextPath = safeNextPath(typeof next === "string" ? next : null);
  if (await getCurrentUser()) {
    redirect({ href: nextPath, locale: await getLocale() });
  }
  const t = await getTranslations("Auth");

  return (
    <>
      <CardHeading
        title={t("loginTitle")}
        subtitle={t("loginSubtitle")}
        notice={!hasSupabaseEnv && <NotConfigured />}
      />
      <LoginForm
        next={nextPath === "/" ? undefined : nextPath}
        initialError={error === "link" ? "linkInvalid" : undefined}
        disabled={!hasSupabaseEnv}
      />
      <CardFooter>
        {t.rich("toSignup", {
          link: (chunks) => (
            <Link
              href="/signup"
              className="text-forest-dark font-bold underline decoration-2 underline-offset-4"
            >
              {chunks}
            </Link>
          ),
        })}
      </CardFooter>
    </>
  );
}

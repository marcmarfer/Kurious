import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { CardFooter, CardHeading } from "@/features/auth/auth-card";
import { NotConfigured } from "@/features/auth/not-configured";
import { getCurrentUser } from "@/features/auth/session";
import { SignupForm } from "@/features/auth/signup-form";
import { Link, redirect } from "@/i18n/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth");
  return { title: t("tabSignup") };
}

export default async function SignupPage() {
  if (await getCurrentUser()) {
    redirect({ href: "/", locale: await getLocale() });
  }
  const t = await getTranslations("Auth");

  return (
    <>
      <SignupForm
        disabled={!hasSupabaseEnv}
        heading={
          <CardHeading
            title={t("signupTitle")}
            subtitle={t("signupSubtitle")}
            notice={!hasSupabaseEnv && <NotConfigured />}
          />
        }
      />
      <CardFooter>
        {t.rich("toLogin", {
          link: (chunks) => (
            <Link
              href="/login"
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

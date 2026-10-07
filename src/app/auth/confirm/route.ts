import type { EmailOtpType, User } from "@supabase/supabase-js";
import { hasLocale } from "next-intl";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const user = await verifyLink(request.nextUrl.searchParams);

  const saved = user?.user_metadata?.locale;
  const locale = hasLocale(routing.locales, saved)
    ? saved
    : routing.defaultLocale;
  if (!user) {
    redirect(
      getPathname({
        href: { pathname: "/login", query: { error: "link" } },
        locale,
      }),
    );
  }
  redirect(getPathname({ href: "/", locale }));
}

const CONFIRM_TYPES: EmailOtpType[] = ["email", "signup"];

async function verifyLink(params: URLSearchParams): Promise<User | null> {
  if (!hasSupabaseEnv) return null;

  const tokenHash = params.get("token_hash");
  const type = CONFIRM_TYPES.find((value) => value === params.get("type"));
  if (!tokenHash || !type) return null;

  const supabase = await createClient();
  const { data } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });
  return data.user;
}

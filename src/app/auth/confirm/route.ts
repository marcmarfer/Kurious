import type { EmailOtpType, User } from "@supabase/supabase-js";
import { hasLocale } from "next-intl";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { INVITE_COOKIE, invitePath } from "@/features/trips/invites";
import { isUuid } from "@/features/trips/validation";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const recovery = params.get("type") === "recovery";
  const user = await verifyLink(params);

  const saved = user?.user_metadata?.locale;
  const locale = hasLocale(routing.locales, saved)
    ? saved
    : routing.defaultLocale;
  if (!user) {
    redirect(
      getPathname({
        href: {
          pathname: recovery ? "/forgot-password" : "/login",
          query: { error: "link" },
        },
        locale,
      }),
    );
  }
  if (recovery) redirect(getPathname({ href: "/reset-password", locale }));
  const invite = (await cookies()).get(INVITE_COOKIE)?.value;
  if (isUuid(invite)) redirect(invitePath(invite));
  redirect(getPathname({ href: "/", locale }));
}

const CONFIRM_TYPES: EmailOtpType[] = ["email", "signup", "recovery"];

async function verifyLink(params: URLSearchParams): Promise<User | null> {
  if (!hasSupabaseEnv) return null;

  const supabase = await createClient();
  const code = params.get("code");
  if (code) {
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    return data.user;
  }

  const tokenHash = params.get("token_hash");
  const type = CONFIRM_TYPES.find((value) => value === params.get("type"));
  if (!tokenHash || !type) return null;

  const { data } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });
  return data.user;
}

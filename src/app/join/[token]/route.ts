import { hasLocale } from "next-intl";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/features/auth/session";
import {
  INVITE_COOKIE,
  INVITE_COOKIE_MAX_AGE,
  invitePath,
} from "@/features/trips/invites";
import { isUuid } from "@/features/trips/validation";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const cookieStore = await cookies();
  const saved = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = hasLocale(routing.locales, saved)
    ? saved
    : routing.defaultLocale;
  const to = (href: Parameters<typeof getPathname>[0]["href"]) =>
    getPathname({ href, locale });

  if (!isUuid(token))
    redirect(to({ pathname: "/trips", query: { invite: "invalid" } }));

  if (!(await getCurrentUser())) {
    cookieStore.set(INVITE_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: INVITE_COOKIE_MAX_AGE,
    });
    redirect(to({ pathname: "/login", query: { next: invitePath(token) } }));
  }

  cookieStore.delete(INVITE_COOKIE);
  const supabase = await createClient();
  const { data: tripId, error } = await supabase.rpc("join_trip", {
    p_token: token,
  });
  if (error || !tripId)
    redirect(to({ pathname: "/trips", query: { invite: "invalid" } }));

  redirect(to(`/trips/${tripId}`));
}

import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { REQUEST_PATH_HEADER } from "@/features/auth/validation";
import {
  CURRENT_TRIP_COOKIE,
  CURRENT_TRIP_MAX_AGE,
  tripIdInPath,
} from "@/features/trips/current-trip";
import { updateSession } from "@/lib/supabase/proxy";

const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  request.headers.set(REQUEST_PATH_HEADER, `${pathname}${search}`);
  const response = handleI18nRouting(request);
  const tripId = tripIdInPath(pathname);
  if (tripId)
    response.cookies.set(CURRENT_TRIP_COOKIE, tripId, {
      path: "/",
      sameSite: "lax",
      maxAge: CURRENT_TRIP_MAX_AGE,
    });
  return updateSession(request, response);
}

export const config = {
  matcher: "/((?!api|auth/|join/|_next|_vercel|.*\\..*).*)",
};

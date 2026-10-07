import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import type { Database } from "./database.types";
import { hasSupabaseEnv, supabasePublishableKey, supabaseUrl } from "./env";

export async function updateSession(
  request: NextRequest,
  response: NextResponse,
) {
  if (!hasSupabaseEnv) {
    return response;
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Keep right after creating the client: it refreshes expired tokens; without it people get logged out.
  await supabase.auth.getClaims();

  return response;
}

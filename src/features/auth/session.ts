import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type CurrentUser = { id: string; email: string; name: string };

// getClaims verifies the JWT; getSession would trust the cookie as is.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!hasSupabaseEnv) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;

  const name = claims.user_metadata?.name;
  return {
    id: claims.sub,
    email: claims.email ?? "",
    name: typeof name === "string" ? name : "",
  };
});

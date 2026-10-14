"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const REFRESH_DELAY_MS = 400;

let mounts = 0;

export function TripLive({ tripId }: { tripId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!hasSupabaseEnv) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), REFRESH_DELAY_MS);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };

    const supabase = createClient();
    const byTrip = `trip_id=eq.${tripId}`;
    const channel = supabase
      .channel(`trip:${tripId}:${++mounts}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ideas", filter: byTrip },
        refresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stages", filter: byTrip },
        refresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trip_members", filter: byTrip },
        refresh,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trips",
          filter: `id=eq.${tripId}`,
        },
        refresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        refresh,
      )
      .subscribe();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      void supabase.removeChannel(channel);
    };
  }, [tripId, router]);

  return null;
}

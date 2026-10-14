import "server-only";
import { cache } from "react";
import { isAvatarColor, type AvatarColor } from "@/components/avatar";
import { getCurrentUser } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import { parseTravelerTags, type TravelerTag } from "./traveler-tags";

export const getMyProfile = cache(
  async (): Promise<{
    name: string;
    tags: TravelerTag[];
    color: AvatarColor | null;
  } | null> => {
    const user = await getCurrentUser();
    if (!user) return null;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("name, traveler_tags, avatar_color")
      .eq("id", user.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      name: data.name,
      tags: parseTravelerTags(data.traveler_tags),
      color: isAvatarColor(data.avatar_color) ? data.avatar_color : null,
    };
  },
);

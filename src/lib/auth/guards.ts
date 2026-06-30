import { createClient } from "@/lib/supabase/server";
import { getGuestSessionFromCookies } from "@/lib/auth/guest-session";
import type { AuthContext, Profile } from "@/types/database.types";

export async function getAuthContext(): Promise<AuthContext> {
  const supabase = await createClient();
  const guestSession = await getGuestSessionFromCookies();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: null,
      profile: null,
      isAdmin: false,
      guestSession,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    userId: user.id,
    profile: profile as Profile | null,
    isAdmin: profile?.role === "admin",
    guestSession,
  };
}

export async function requireAuth() {
  const ctx = await getAuthContext();
  if (!ctx.userId) {
    throw new Error("Authentication required");
  }
  return ctx;
}

export async function requireAdmin() {
  const ctx = await requireAuth();
  if (!ctx.isAdmin) {
    throw new Error("Admin access required");
  }
  return ctx;
}

export async function canAccessEvent(eventId: string): Promise<boolean> {
  const ctx = await getAuthContext();

  if (ctx.isAdmin) return true;

  if (ctx.guestSession?.eventId === eventId) return true;

  if (ctx.userId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("event_participants")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", ctx.userId)
      .maybeSingle();
    return !!data;
  }

  return false;
}

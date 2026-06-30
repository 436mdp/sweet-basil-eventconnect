import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { guestJoinSchema } from "@/lib/validations/auth.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  createGuestToken,
  GUEST_COOKIE_NAME,
  guestCookieOptions,
} from "@/lib/auth/guest-session";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limit = rateLimit(`guest-join:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = guestJoinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: event } = await supabase
    .from("events")
    .select("id, slug, status")
    .eq("slug", parsed.data.eventSlug)
    .single();

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event.status === "closed") return NextResponse.json({ error: "This event has ended" }, { status: 410 });
  if (event.status === "upcoming") return NextResponse.json({ error: "This event has not started yet" }, { status: 403 });

  const sessionToken = nanoid(32);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: guestSession, error } = await supabase
    .from("guest_sessions")
    .insert({
      event_id: event.id,
      guest_name: parsed.data.guestName,
      guest_email: parsed.data.guestEmail || null,
      session_token: sessionToken,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("event_participants").insert({
    event_id: event.id,
    guest_name: parsed.data.guestName,
    guest_email: parsed.data.guestEmail || null,
    guest_session_id: guestSession.id,
  });

  const token = await createGuestToken({
    guestSessionId: guestSession.id,
    eventId: event.id,
    guestName: parsed.data.guestName,
  });

  const cookieStore = await cookies();
  cookieStore.set(GUEST_COOKIE_NAME, token, guestCookieOptions());

  return NextResponse.json({ success: true, eventId: event.id });
}

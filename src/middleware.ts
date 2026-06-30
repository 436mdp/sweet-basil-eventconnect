import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { verifyGuestToken, GUEST_COOKIE_NAME } from "@/lib/auth/guest-session";

const publicPaths = ["/", "/about", "/contact", "/login", "/register", "/auth/callback"];
const adminPaths = ["/admin"];
const userPaths = ["/dashboard"];

function isPublicPath(pathname: string) {
  return (
    publicPaths.some((p) => pathname === p) ||
    pathname.startsWith("/join/") ||
    pathname.startsWith("/api/health")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const supabaseResponse = await updateSession(request);

  const isAdminRoute = adminPaths.some((p) => pathname.startsWith(p));
  const isUserRoute = userPaths.some((p) => pathname.startsWith(p));
  const isEventRoute = pathname.startsWith("/events/");

  if (isPublicPath(pathname)) {
    return supabaseResponse;
  }

  const authCookie = request.cookies.getAll().find((c) => c.name.includes("auth-token"));
  const guestToken = request.cookies.get(GUEST_COOKIE_NAME)?.value;
  const guestSession = guestToken ? await verifyGuestToken(guestToken) : null;

  const hasAuth = !!authCookie;

  if (isAdminRoute && !hasAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isUserRoute && !hasAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isEventRoute && !hasAuth && !guestSession) {
    const eventId = pathname.split("/")[2];
    if (eventId) {
      return NextResponse.redirect(new URL(`/login?redirect=/events/${eventId}`, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

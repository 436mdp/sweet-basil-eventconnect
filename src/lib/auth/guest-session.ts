import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { GuestSessionPayload } from "@/types/database.types";

export const GUEST_COOKIE_NAME = "sb-guest-session";

function getSecret() {
  const secret = process.env.GUEST_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("GUEST_SESSION_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function createGuestToken(payload: Omit<GuestSessionPayload, "exp">) {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
  return new SignJWT({ ...payload, exp })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(getSecret());
}

export async function verifyGuestToken(token: string): Promise<GuestSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as GuestSessionPayload;
  } catch {
    return null;
  }
}

export async function getGuestSessionFromCookies(): Promise<GuestSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(GUEST_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyGuestToken(token);
}

export function guestCookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

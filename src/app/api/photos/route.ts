import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { photoQuerySchema } from "@/lib/validations/photo.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limit = rateLimit(`photos:${ip}`, { limit: 100, windowMs: 60_000 });
  if (!limit.success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = photoQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const { eventId, cursor, uploader, search, limit: pageLimit } = parsed.data;
  const supabase = await createClient();

  let query = supabase
    .from("photos")
    .select("*")
    .eq("event_id", eventId)
    .order("uploaded_at", { ascending: false })
    .limit(pageLimit);

  if (uploader) query = query.eq("uploader_name", uploader);
  if (search) query = query.or(`file_name.ilike.%${search}%,uploader_name.ilike.%${search}%`);
  if (cursor) query = query.lt("uploaded_at", cursor);

  const { data: photos, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const hasMore = (photos?.length ?? 0) === pageLimit;
  const nextCursor = photos?.length ? photos[photos.length - 1].uploaded_at : null;

  return NextResponse.json({ photos: photos ?? [], hasMore, nextCursor });
}

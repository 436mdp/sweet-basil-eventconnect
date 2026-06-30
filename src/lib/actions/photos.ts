"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth/guards";
import {
  createGuestToken,
  GUEST_COOKIE_NAME,
  guestCookieOptions,
} from "@/lib/auth/guest-session";
import { guestJoinSchema } from "@/lib/validations/auth.schema";
import { getPublicStorageUrl } from "@/lib/utils";
import { photoUploadSchema } from "@/lib/validations/photo.schema";

export async function joinEventAsGuest(formData: FormData) {
  const parsed = guestJoinSchema.safeParse({
    guestName: formData.get("guestName"),
    guestEmail: formData.get("guestEmail") || undefined,
    eventSlug: formData.get("eventSlug"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = createServiceClient();
  const { data: event } = await supabase
    .from("events")
    .select("id, slug, status, name")
    .eq("slug", parsed.data.eventSlug)
    .single();

  if (!event) return { error: "Event not found" };
  if (event.status === "closed") return { error: "This event has ended" };
  if (event.status === "upcoming") return { error: "This event has not started yet" };

  const sessionToken = nanoid(32);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: guestSession, error: guestError } = await supabase
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

  if (guestError) return { error: guestError.message };

  await supabase.from("event_participants").insert({
    event_id: event.id,
    guest_name: parsed.data.guestName,
    guest_email: parsed.data.guestEmail || null,
    guest_session_id: guestSession.id,
  });

  await supabase.from("activity_logs").insert({
    guest_session_id: guestSession.id,
    action: "guest_joined",
    resource_type: "event",
    resource_id: event.id,
    metadata: { guest_name: parsed.data.guestName },
  });

  const token = await createGuestToken({
    guestSessionId: guestSession.id,
    eventId: event.id,
    guestName: parsed.data.guestName,
  });

  const cookieStore = await cookies();
  cookieStore.set(GUEST_COOKIE_NAME, token, guestCookieOptions());

  return { success: true, eventId: event.id, slug: event.slug };
}

export async function joinEventAsUser(eventId: string) {
  const ctx = await getAuthContext();
  if (!ctx.userId) return { error: "Authentication required" };

  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("id, status")
    .eq("id", eventId)
    .single();

  if (!event) return { error: "Event not found" };
  if (event.status === "closed") return { error: "This event has ended" };

  const { data: existing } = await supabase
    .from("event_participants")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", ctx.userId)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from("event_participants").insert({
      event_id: eventId,
      user_id: ctx.userId,
    });
    if (error) return { error: error.message };
  }

  return { success: true };
}

export async function uploadPhoto(formData: FormData) {
  const ctx = await getAuthContext();
  const eventId = formData.get("eventId") as string;
  const file = formData.get("file") as File;

  if (!file || !eventId) return { error: "Missing file or event" };

  const parsed = photoUploadSchema.safeParse({
    eventId,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid file" };
  }

  const supabase = await createClient();
  const serviceClient = createServiceClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, status")
    .eq("id", eventId)
    .single();

  if (!event || event.status !== "active") {
    return { error: "Event is not accepting uploads" };
  }

  const isGuest = ctx.guestSession?.eventId === eventId;
  const isUser = !!ctx.userId;

  if (!isGuest && !isUser && !ctx.isAdmin) {
    return { error: "You must join the event to upload photos" };
  }

  const uploaderId = ctx.userId ?? ctx.guestSession!.guestSessionId;
  const uploaderName = ctx.profile?.name ?? ctx.guestSession!.guestName;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${eventId}/${uploaderId}/${nanoid()}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadClient = isGuest ? serviceClient : supabase;
  const { error: uploadError } = await uploadClient.storage
    .from("event-images")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) return { error: uploadError.message };

  const fileUrl = getPublicStorageUrl(storagePath);
  const insertClient = isGuest ? serviceClient : supabase;

  const { data: photo, error: dbError } = await insertClient
    .from("photos")
    .insert({
      event_id: eventId,
      user_id: ctx.userId,
      guest_session_id: isGuest ? ctx.guestSession!.guestSessionId : null,
      uploader_name: uploaderName,
      file_name: safeName,
      storage_path: storagePath,
      file_url: fileUrl,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single();

  if (dbError) return { error: dbError.message };

  await insertClient.from("activity_logs").insert({
    user_id: ctx.userId,
    guest_session_id: isGuest ? ctx.guestSession!.guestSessionId : null,
    action: "photo_uploaded",
    resource_type: "photo",
    resource_id: photo.id,
    metadata: { event_id: eventId },
  });

  revalidatePath(`/events/${eventId}`);
  return { success: true, photo };
}

export async function recordPhotoView(photoId: string, eventId: string) {
  const ctx = await getAuthContext();
  const supabase = await createClient();

  await supabase.from("activity_logs").insert({
    user_id: ctx.userId,
    guest_session_id: ctx.guestSession?.guestSessionId ?? null,
    action: "photo_viewed",
    resource_type: "photo",
    resource_id: photoId,
    metadata: { event_id: eventId },
  });

  if (ctx.userId) {
    const { data: participant } = await supabase
      .from("event_participants")
      .select("photos_viewed")
      .eq("event_id", eventId)
      .eq("user_id", ctx.userId)
      .maybeSingle();

    if (participant) {
      await supabase
        .from("event_participants")
        .update({ photos_viewed: participant.photos_viewed + 1 })
        .eq("event_id", eventId)
        .eq("user_id", ctx.userId);
    }
  }

  return { success: true };
}

export async function deletePhoto(photoId: string) {
  const ctx = await getAuthContext();
  if (!ctx.userId && !ctx.isAdmin) return { error: "Unauthorized" };

  const supabase = await createClient();
  const { data: photo } = await supabase
    .from("photos")
    .select("*")
    .eq("id", photoId)
    .single();

  if (!photo) return { error: "Photo not found" };
  if (!ctx.isAdmin && photo.user_id !== ctx.userId) return { error: "Unauthorized" };

  await supabase.storage.from("event-images").remove([photo.storage_path]);
  await supabase.from("photos").delete().eq("id", photoId);

  revalidatePath(`/events/${photo.event_id}`);
  return { success: true };
}

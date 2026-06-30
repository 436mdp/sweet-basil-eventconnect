"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { generateEventQR } from "@/lib/qr";
import { createEventSchema, updateEventSchema } from "@/lib/validations/event.schema";
import type { EventStatus } from "@/types/database.types";

export async function createEvent(formData: FormData) {
  const ctx = await requireAdmin();
  const supabase = await createClient();

  const parsed = createEventSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    venue: formData.get("venue") || undefined,
    eventDate: formData.get("eventDate"),
    status: formData.get("status") || "upcoming",
    coverImage: formData.get("coverImage") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const slug = nanoid(10);
  const qrCodeUrl = await generateEventQR(slug);

  const { data, error } = await supabase
    .from("events")
    .insert({
      slug,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      venue: parsed.data.venue ?? null,
      event_date: parsed.data.eventDate,
      status: parsed.data.status,
      cover_image: parsed.data.coverImage || null,
      qr_code_url: qrCodeUrl,
      created_by: ctx.userId,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    user_id: ctx.userId,
    action: "event_created",
    resource_type: "event",
    resource_id: data.id,
    metadata: { event_name: data.name },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/events");
  return { success: true, event: data };
}

export async function updateEvent(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const parsed = updateEventSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name") || undefined,
    description: formData.get("description") || undefined,
    venue: formData.get("venue") || undefined,
    eventDate: formData.get("eventDate") || undefined,
    status: formData.get("status") || undefined,
    coverImage: formData.get("coverImage") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { id, eventDate, coverImage, ...rest } = parsed.data;
  const updates: Record<string, unknown> = { ...rest };
  if (eventDate) updates.event_date = eventDate;
  if (coverImage !== undefined) updates.cover_image = coverImage || null;

  const { error } = await supabase.from("events").update(updates).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/events");
  revalidatePath(`/events/${id}`);
  return { success: true };
}

export async function deleteEvent(eventId: string) {
  const ctx = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    user_id: ctx.userId,
    action: "event_deleted",
    resource_type: "event",
    resource_id: eventId,
  });

  revalidatePath("/admin/events");
  return { success: true };
}

export async function closeEvent(eventId: string) {
  const ctx = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .update({ status: "closed" as EventStatus })
    .eq("id", eventId);

  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    user_id: ctx.userId,
    action: "event_closed",
    resource_type: "event",
    resource_id: eventId,
  });

  revalidatePath("/admin/events");
  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

export async function regenerateQR(eventId: string, slug: string) {
  await requireAdmin();
  const supabase = await createClient();
  const qrCodeUrl = await generateEventQR(slug);

  const { error } = await supabase
    .from("events")
    .update({ qr_code_url: qrCodeUrl })
    .eq("id", eventId);

  if (error) return { error: error.message };
  revalidatePath("/admin/events");
  return { success: true, qrCodeUrl };
}

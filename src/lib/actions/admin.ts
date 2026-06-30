"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import type { AdminStats } from "@/types/database.types";

export async function getAdminStats(): Promise<AdminStats> {
  await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase.from("admin_stats").select("*").single();
  return (data as AdminStats) ?? {
    total_events: 0,
    active_events: 0,
    registered_users: 0,
    guest_participants: 0,
    uploaded_photos: 0,
  };
}

export async function getUploadActivity(days = 30) {
  await requireAdmin();
  const serviceClient = createServiceClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await serviceClient
    .from("photos")
    .select("uploaded_at")
    .gte("uploaded_at", since.toISOString())
    .order("uploaded_at", { ascending: true });

  const counts: Record<string, number> = {};
  (data ?? []).forEach((photo) => {
    const day = photo.uploaded_at.split("T")[0];
    counts[day] = (counts[day] ?? 0) + 1;
  });

  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

export async function getParticipationActivity(days = 30) {
  await requireAdmin();
  const serviceClient = createServiceClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await serviceClient
    .from("event_participants")
    .select("joined_at")
    .gte("joined_at", since.toISOString());

  const counts: Record<string, number> = {};
  (data ?? []).forEach((p) => {
    const day = p.joined_at.split("T")[0];
    counts[day] = (counts[day] ?? 0) + 1;
  });

  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

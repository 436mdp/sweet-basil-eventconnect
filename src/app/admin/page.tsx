import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Calendar, Camera, Users, ImageIcon, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth/guards";
import { getAdminStats, getUploadActivity, getParticipationActivity } from "@/lib/actions/admin";
import { AdminNav } from "@/components/admin/admin-nav";
import { ActivityChart } from "@/components/admin/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Event, Photo } from "@/types/database.types";

export default async function AdminDashboardPage() {
  const ctx = await getAuthContext();
  if (!ctx.isAdmin) redirect("/login");

  const supabase = await createClient();
  const [stats, uploads, participation] = await Promise.all([
    getAdminStats(),
    getUploadActivity(),
    getParticipationActivity(),
  ]);

  const { data: recentEvents } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentUploads } = await supabase
    .from("photos")
    .select("*, events(name)")
    .order("uploaded_at", { ascending: false })
    .limit(5);

  const statCards = [
    { label: "Total Events", value: stats.total_events, icon: Calendar },
    { label: "Active Events", value: stats.active_events, icon: Activity },
    { label: "Registered Users", value: stats.registered_users, icon: Users },
    { label: "Guest Participants", value: stats.guest_participants, icon: Users },
    { label: "Uploaded Photos", value: stats.uploaded_photos, icon: ImageIcon },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-primary">Admin Dashboard</h1>
      <AdminNav currentPath="/admin" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <stat.icon className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <ActivityChart title="Upload Activity" data={uploads} />
        <ActivityChart title="Event Participation" data={participation} color="#D4AF37" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(recentEvents as Event[] ?? []).map((event) => (
                <div key={event.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.event_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Badge className="capitalize">{event.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(recentUploads as (Photo & { events: { name: string } })[] ?? []).map((photo) => (
                <div key={photo.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <Camera className="h-4 w-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{photo.uploader_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {photo.events?.name} · {format(new Date(photo.uploaded_at), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

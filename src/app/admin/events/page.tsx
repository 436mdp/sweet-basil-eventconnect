import { redirect } from "next/navigation";
import { format } from "date-fns";
import { getAuthContext } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { EventForm } from "@/components/admin/event-form";
import { QRDisplay } from "@/components/events/qr-display";
import { EventActions } from "@/components/admin/event-actions";
import { Badge } from "@/components/ui/badge";
import { getJoinUrl } from "@/lib/qr";
import type { Event } from "@/types/database.types";

export default async function AdminEventsPage() {
  const ctx = await getAuthContext();
  if (!ctx.isAdmin) redirect("/login");

  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  const eventList = (events ?? []) as Event[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-primary">Manage Events</h1>
      <AdminNav currentPath="/admin/events" />

      <div className="grid gap-8 lg:grid-cols-2">
        <EventForm />

        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold">All Events ({eventList.length})</h2>
          {eventList.map((event) => (
            <div key={event.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{event.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.event_date), "MMM d, yyyy")} · {event.venue}
                  </p>
                </div>
                <Badge className="capitalize">{event.status}</Badge>
              </div>
              {event.qr_code_url && (
                <div className="mt-4">
                  <QRDisplay
                    qrCodeUrl={event.qr_code_url}
                    joinUrl={getJoinUrl(event.slug)}
                    eventName={event.name}
                  />
                </div>
              )}
              <EventActions event={event} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

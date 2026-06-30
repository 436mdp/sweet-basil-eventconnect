import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Camera, Eye, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth/guards";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Event, EventParticipant } from "@/types/database.types";

export default async function DashboardPage() {
  const ctx = await getAuthContext();
  if (!ctx.userId) redirect("/login");

  const supabase = await createClient();
  const { data: participations } = await supabase
    .from("event_participants")
    .select("*, events(*)")
    .eq("user_id", ctx.userId)
    .order("joined_at", { ascending: false });

  const events = (participations ?? []) as (EventParticipant & { events: Event })[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold text-primary">
            Welcome, {ctx.profile?.name?.split(" ")[0] ?? "Guest"}
          </h1>
          <p className="mt-2 text-muted-foreground">Your event history and activity</p>
        </div>
        <form action={signOut}>
          <Button variant="outline" type="submit">Sign Out</Button>
        </form>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{events.length}</p>
              <p className="text-sm text-muted-foreground">Events Attended</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Camera className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">
                {events.reduce((sum, e) => sum + e.photos_uploaded, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Photos Uploaded</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Eye className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">
                {events.reduce((sum, e) => sum + e.photos_viewed, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Photos Viewed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Past Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              You haven&apos;t joined any events yet. Scan a QR code to get started!
            </p>
          ) : (
            <div className="space-y-4">
              {events.map((p) => (
                <Link
                  key={p.id}
                  href={`/events/${p.event_id}`}
                  className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <h3 className="font-semibold">{p.events?.name}</h3>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {p.events?.event_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(p.events.event_date), "MMM d, yyyy")}
                        </span>
                      )}
                      {p.events?.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {p.events.venue}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{p.photos_uploaded} uploaded</Badge>
                    <Badge variant="outline">{p.photos_viewed} viewed</Badge>
                    {p.events?.status && (
                      <Badge className="capitalize">{p.events.status}</Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

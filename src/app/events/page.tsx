import { createClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/events/event-card";
import type { Event } from "@/types/database.types";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .in("status", ["active", "upcoming"])
    .order("event_date", { ascending: true });

  const eventList = (events ?? []) as Event[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-primary">Events</h1>
        <p className="mt-2 text-muted-foreground">
          Browse upcoming and active celebrations
        </p>
      </div>

      {eventList.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <p>No events available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {eventList.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

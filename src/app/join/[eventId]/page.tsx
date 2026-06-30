import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GuestJoinForm } from "@/components/events/guest-join-form";
import { EventClosed } from "@/components/events/event-closed";
import type { Event } from "@/types/database.types";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default async function JoinEventPage({ params }: PageProps) {
  const { eventId: slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!event) notFound();

  const typedEvent = event as Event;

  if (typedEvent.status === "closed") {
    return <EventClosed event={typedEvent} reason="This event has ended. Thank you for celebrating with us!" />;
  }

  if (typedEvent.status === "upcoming") {
    return <EventClosed event={typedEvent} reason="This event hasn't started yet. Check back soon!" />;
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-secondary">You&apos;re Invited</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-primary">{typedEvent.name}</h1>
        {typedEvent.venue && (
          <p className="mt-2 text-muted-foreground">{typedEvent.venue}</p>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          Enter your name to join the photo gallery. No account required.
        </p>
      </div>
      <GuestJoinForm eventSlug={slug} eventId={typedEvent.id} />
    </div>
  );
}

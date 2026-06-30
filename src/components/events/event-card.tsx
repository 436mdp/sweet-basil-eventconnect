import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Event, EventStatus } from "@/types/database.types";

const statusVariant: Record<EventStatus, "success" | "default" | "destructive"> = {
  active: "success",
  upcoming: "default",
  closed: "destructive",
};

interface EventCardProps {
  event: Event;
  photoCount?: number;
}

export function EventCard({ event, photoCount }: EventCardProps) {
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {event.cover_image ? (
            <Image
              src={event.cover_image}
              alt={event.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-primary/10 font-serif text-2xl text-primary">
              {event.name.charAt(0)}
            </div>
          )}
          <Badge variant={statusVariant[event.status]} className="absolute right-3 top-3 capitalize">
            {event.status}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-serif text-xl font-semibold group-hover:text-primary">{event.name}</h3>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(event.event_date), "MMM d, yyyy")}
            </span>
            {event.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {event.venue}
              </span>
            )}
          </div>
          {photoCount !== undefined && (
            <p className="mt-2 text-sm text-muted-foreground">{photoCount} photos</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

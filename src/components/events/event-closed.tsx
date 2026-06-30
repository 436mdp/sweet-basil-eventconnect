import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types/database.types";

interface EventClosedProps {
  event: Event;
  reason: string;
}

export function EventClosed({ event, reason }: EventClosedProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <span className="text-3xl">🌿</span>
      </div>
      <h1 className="font-serif text-3xl font-bold text-primary">{event.name}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{reason}</p>
      <Link href="/" className="mt-8">
        <Button variant="outline">Return Home</Button>
      </Link>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { closeEvent, deleteEvent } from "@/lib/actions/events";
import type { Event } from "@/types/database.types";

interface EventActionsProps {
  event: Event;
}

export function EventActions({ event }: EventActionsProps) {
  const router = useRouter();

  const handleClose = async () => {
    const result = await closeEvent(event.id);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Event closed");
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this event and all photos? This cannot be undone.")) return;
    const result = await deleteEvent(event.id);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Event deleted");
      router.refresh();
    }
  };

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {event.status !== "closed" && (
        <Button variant="outline" size="sm" onClick={handleClose}>
          Close Event
        </Button>
      )}
      <Button variant="destructive" size="sm" onClick={handleDelete}>
        Delete Event
      </Button>
    </div>
  );
}

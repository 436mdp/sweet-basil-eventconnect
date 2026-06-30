"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createEvent, updateEvent } from "@/lib/actions/events";
import type { Event, EventStatus } from "@/types/database.types";

interface EventFormProps {
  event?: Event;
  onSuccess?: () => void;
}

export function EventForm({ event, onSuccess }: EventFormProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<EventStatus>(event?.status ?? "upcoming");
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    formData.set("status", status);
    const result = event
      ? await updateEvent(formData)
      : await createEvent(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(event ? "Event updated!" : "Event created!");
      router.refresh();
      onSuccess?.();
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{event ? "Edit Event" : "Create Event"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {event && <input type="hidden" name="id" value={event.id} />}
          <div>
            <Label htmlFor="name">Event Name</Label>
            <Input id="name" name="name" required defaultValue={event?.name} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={event?.description ?? ""} className="mt-1" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="eventDate">Event Date</Label>
              <Input
                id="eventDate"
                name="eventDate"
                type="datetime-local"
                required
                defaultValue={event?.event_date?.slice(0, 16)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="venue">Venue</Label>
              <Input id="venue" name="venue" defaultValue={event?.venue ?? ""} className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="coverImageFile">Cover Image</Label>
            <Input
              id="coverImageFile"
              name="coverImageFile"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-1"
            />
            {event?.cover_image && (
              <div className="mt-3 rounded-xl overflow-hidden border bg-muted">
                <img src={event.cover_image} alt="Current cover" className="h-40 w-full object-cover" />
              </div>
            )}
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as EventStatus)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : event ? "Update Event" : "Create Event"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

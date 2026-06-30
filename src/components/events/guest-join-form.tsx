"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { joinEventAsGuest } from "@/lib/actions/photos";

interface GuestJoinFormProps {
  eventSlug: string;
  eventId: string;
}

export function GuestJoinForm({ eventSlug, eventId }: GuestJoinFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    if (loading) return;

    setLoading(true);
    formData.set("eventSlug", eventSlug);

    try {
      const result = await joinEventAsGuest(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Welcome to the event!");
      router.push(`/events/${eventId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="guestName">Full Name *</Label>
            <Input id="guestName" name="guestName" required placeholder="Your name" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="guestEmail">Email (optional)</Label>
            <Input id="guestEmail" name="guestEmail" type="email" placeholder="you@example.com" className="mt-1" />
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            {loading ? "Joining..." : "Join Event"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface JoinEventButtonProps {
  eventId: string;
  joinAction: (eventId: string) => Promise<{ error?: string; success?: boolean }>;
}

export function JoinEventButton({ eventId, joinAction }: JoinEventButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    setLoading(true);
    const result = await joinAction(eventId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("You've joined the event!");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="mb-8 rounded-xl border bg-card p-6 text-center">
      <p className="mb-4 text-muted-foreground">Join this event to upload and view photos</p>
      <Button onClick={handleJoin} disabled={loading}>
        {loading ? "Joining..." : "Join Event"}
      </Button>
    </div>
  );
}

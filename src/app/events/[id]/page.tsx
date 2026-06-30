import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { Calendar, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth/guards";
import { joinEventAsUser } from "@/lib/actions/photos";
import { Badge } from "@/components/ui/badge";
import { Dropzone } from "@/components/upload/dropzone";
import { MasonryGallery } from "@/components/gallery/masonry-gallery";
import { JoinEventButton } from "@/components/events/join-event-button";
import type { Event, Photo, UploaderFolder } from "@/types/database.types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const ctx = await getAuthContext();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) notFound();

  const typedEvent = event as Event;

  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("event_id", id)
    .order("uploaded_at", { ascending: false })
    .limit(24);

  const { data: uploaderRows } = await supabase
    .from("photos")
    .select("uploader_name, uploaded_at")
    .eq("event_id", id);

  const uploaderMap = new Map<string, UploaderFolder>();
  (uploaderRows ?? []).forEach((row) => {
    const existing = uploaderMap.get(row.uploader_name);
    if (!existing) {
      uploaderMap.set(row.uploader_name, {
        uploader_name: row.uploader_name,
        photo_count: 1,
        latest_upload: row.uploaded_at,
      });
    } else {
      existing.photo_count += 1;
      if (row.uploaded_at > existing.latest_upload) {
        existing.latest_upload = row.uploaded_at;
      }
    }
  });

  const uploaders = Array.from(uploaderMap.values()).sort(
    (a, b) => new Date(b.latest_upload).getTime() - new Date(a.latest_upload).getTime()
  );

  const canUpload =
    typedEvent.status === "active" &&
    (ctx.isAdmin ||
      ctx.guestSession?.eventId === id ||
      !!ctx.userId);

  const hasAccess =
    ctx.isAdmin ||
    ctx.guestSession?.eventId === id ||
    !!ctx.userId;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative mb-8 overflow-hidden rounded-2xl">
        <div className="relative aspect-[21/9] bg-muted">
          {typedEvent.cover_image ? (
            <Image
              src={typedEvent.cover_image}
              alt={typedEvent.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-primary/10 font-serif text-4xl text-primary">
              {typedEvent.name}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
            <Badge className="mb-3 capitalize">{typedEvent.status}</Badge>
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">{typedEvent.name}</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm opacity-90">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(typedEvent.event_date), "EEEE, MMMM d, yyyy")}
              </span>
              {typedEvent.venue && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {typedEvent.venue}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {typedEvent.description && (
        <p className="mb-8 text-muted-foreground">{typedEvent.description}</p>
      )}

      {!hasAccess && ctx.userId && (
        <JoinEventButton eventId={id} joinAction={joinEventAsUser} />
      )}

      {canUpload && (
        <section className="mb-12">
          <h2 className="mb-4 font-serif text-2xl font-semibold">Upload Photos</h2>
          <Dropzone eventId={id} />
        </section>
      )}

      {typedEvent.status === "closed" && !canUpload && (
        <div className="mb-8 rounded-xl bg-muted p-4 text-center text-muted-foreground">
          This event has ended. You can still view the gallery below.
        </div>
      )}

      <section>
        <h2 className="mb-6 font-serif text-2xl font-semibold">Gallery</h2>
        <MasonryGallery
          eventId={id}
          initialPhotos={(photos ?? []) as Photo[]}
          uploaders={uploaders}
        />
      </section>
    </div>
  );
}

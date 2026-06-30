import { redirect } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { Download } from "lucide-react";
import Link from "next/link";
import { getAuthContext } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";
import type { Photo } from "@/types/database.types";

export default async function AdminUploadsPage() {
  const ctx = await getAuthContext();
  if (!ctx.isAdmin) redirect("/login");

  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("photos")
    .select("*, events(name, id)")
    .order("uploaded_at", { ascending: false })
    .limit(50);

  const photoList = (photos ?? []) as (Photo & { events: { name: string; id: string } })[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-primary">All Uploads</h1>
      <AdminNav currentPath="/admin/uploads" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {photoList.map((photo) => (
          <div key={photo.id} className="overflow-hidden rounded-xl border bg-card">
            <div className="relative aspect-square">
              <Image
                src={photo.file_url}
                alt={photo.file_name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-medium">{photo.uploader_name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {photo.events?.name} · {format(new Date(photo.uploaded_at), "MMM d, h:mm a")}
              </p>
              <p className="text-xs text-muted-foreground">{formatBytes(photo.file_size)}</p>
              <Link href={`/api/photos/${photo.id}/download`}>
                <Button variant="outline" size="sm" className="mt-2 w-full gap-2">
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

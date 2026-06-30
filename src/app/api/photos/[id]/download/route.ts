import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: photo, error } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  await supabase.from("activity_logs").insert({
    action: "photo_downloaded",
    resource_type: "photo",
    resource_id: photo.id,
    metadata: { event_id: photo.event_id },
  });

  const response = await fetch(photo.file_url);
  const blob = await response.blob();

  return new NextResponse(blob, {
    headers: {
      "Content-Type": photo.mime_type,
      "Content-Disposition": `attachment; filename="${photo.file_name}"`,
    },
  });
}

import { NextResponse } from "next/server";
import { getAdminStats, getUploadActivity, getParticipationActivity } from "@/lib/actions/admin";

export async function GET() {
  try {
    const [stats, uploads, participation] = await Promise.all([
      getAdminStats(),
      getUploadActivity(),
      getParticipationActivity(),
    ]);
    return NextResponse.json({ stats, uploads, participation });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
}

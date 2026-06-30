import QRCode from "qrcode";
import { getAppUrl } from "@/lib/utils";

export async function generateEventQR(slug: string): Promise<string> {
  const url = `${getAppUrl()}/join/${slug}`;
  return QRCode.toDataURL(url, {
    width: 512,
    margin: 2,
    color: {
      dark: "#556B2F",
      light: "#FFFFFF",
    },
  });
}

export function getJoinUrl(slug: string): string {
  return `${getAppUrl()}/join/${slug}`;
}

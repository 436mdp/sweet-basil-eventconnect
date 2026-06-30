import imageCompression from "browser-image-compression";
import { ALLOWED_MIME_TYPES } from "@/lib/validations/photo.schema";

const MAX_SIZE_MB = 20;

export async function compressImage(file: File): Promise<File> {
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    throw new Error("Invalid file type. Allowed: JPG, PNG, WEBP");
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`File exceeds ${MAX_SIZE_MB}MB limit`);
  }

  const options = {
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type as string,
  };

  try {
    const compressed = await imageCompression(file, options);
    if (compressed.size > MAX_SIZE_MB * 1024 * 1024) {
      throw new Error(`Compressed file still exceeds ${MAX_SIZE_MB}MB`);
    }
    return compressed;
  } catch {
    return file;
  }
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return "Invalid file type. Allowed: JPG, PNG, WEBP";
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `File exceeds ${MAX_SIZE_MB}MB limit`;
  }
  return null;
}

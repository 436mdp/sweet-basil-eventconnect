import { z } from "zod";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const photoUploadSchema = z.object({
  eventId: z.string().uuid(),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().max(20 * 1024 * 1024, "Maximum file size is 20MB"),
  mimeType: z.enum(ALLOWED_MIME_TYPES),
});

export const photoQuerySchema = z.object({
  eventId: z.string().uuid(),
  cursor: z.string().optional(),
  uploader: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(24),
});

export type PhotoUploadInput = z.infer<typeof photoUploadSchema>;
export type PhotoQueryInput = z.infer<typeof photoQuerySchema>;

export { ALLOWED_MIME_TYPES };

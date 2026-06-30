import { z } from "zod";

export const eventStatusSchema = z.enum(["upcoming", "active", "closed"]);

export const createEventSchema = z.object({
  name: z.string().min(2, "Event name is required").max(200),
  description: z.string().max(2000).optional(),
  venue: z.string().max(300).optional(),
  eventDate: z.string().min(1, "Event date is required"),
  status: eventStatusSchema.default("upcoming"),
  coverImage: z.string().url().optional().or(z.literal("")),
});

export const updateEventSchema = createEventSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

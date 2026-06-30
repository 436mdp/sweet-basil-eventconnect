import { describe, it, expect } from "vitest";
import { createEventSchema, eventStatusSchema } from "@/lib/validations/event.schema";

describe("event integration", () => {
  it("accepts all valid event statuses", () => {
    for (const status of ["upcoming", "active", "closed"]) {
      expect(eventStatusSchema.safeParse(status).success).toBe(true);
    }
  });

  it("creates valid event payload for server action", () => {
    const formData = {
      name: "Summer Wedding",
      description: "A beautiful celebration",
      venue: "Garden Pavilion",
      eventDate: "2025-08-15T17:00:00",
      status: "active" as const,
      coverImage: "https://example.com/cover.jpg",
    };

    const result = createEventSchema.safeParse(formData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Summer Wedding");
      expect(result.data.status).toBe("active");
    }
  });
});

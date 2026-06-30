import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, guestJoinSchema } from "@/lib/validations/auth.schema";
import { createEventSchema } from "@/lib/validations/event.schema";
import { photoUploadSchema } from "@/lib/validations/photo.schema";

describe("auth schemas", () => {
  it("validates login input", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "Password1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "Password1",
    });
    expect(result.success).toBe(false);
  });

  it("validates register input", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "Password1",
    });
    expect(result.success).toBe(true);
  });

  it("validates guest join input", () => {
    const result = guestJoinSchema.safeParse({
      guestName: "Jane Guest",
      guestEmail: "",
      eventSlug: "abc123",
    });
    expect(result.success).toBe(true);
  });
});

describe("event schema", () => {
  it("validates event creation", () => {
    const result = createEventSchema.safeParse({
      name: "Wedding Reception",
      eventDate: "2025-12-01T18:00:00",
      status: "upcoming",
    });
    expect(result.success).toBe(true);
  });
});

describe("photo schema", () => {
  it("validates photo upload metadata", () => {
    const result = photoUploadSchema.safeParse({
      eventId: "550e8400-e29b-41d4-a716-446655440000",
      fileName: "photo.jpg",
      fileSize: 1024 * 1024,
      mimeType: "image/jpeg",
    });
    expect(result.success).toBe(true);
  });

  it("rejects oversized files", () => {
    const result = photoUploadSchema.safeParse({
      eventId: "550e8400-e29b-41d4-a716-446655440000",
      fileName: "photo.jpg",
      fileSize: 25 * 1024 * 1024,
      mimeType: "image/jpeg",
    });
    expect(result.success).toBe(false);
  });
});

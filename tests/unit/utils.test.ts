import { describe, it, expect } from "vitest";
import { getJoinUrl } from "@/lib/qr";
import { formatBytes } from "@/lib/utils";

describe("qr utilities", () => {
  it("generates join URL", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.com";
    expect(getJoinUrl("abc123")).toBe("https://example.com/join/abc123");
  });
});

describe("formatBytes", () => {
  it("formats bytes correctly", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1048576)).toBe("1 MB");
  });
});

describe("rate limiting", () => {
  it("allows requests within limit", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const key = `test-${Date.now()}`;
    const result = rateLimit(key, { limit: 3, windowMs: 60000 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks requests over limit", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const key = `test-block-${Date.now()}`;
    rateLimit(key, { limit: 2, windowMs: 60000 });
    rateLimit(key, { limit: 2, windowMs: 60000 });
    const result = rateLimit(key, { limit: 2, windowMs: 60000 });
    expect(result.success).toBe(false);
  });
});

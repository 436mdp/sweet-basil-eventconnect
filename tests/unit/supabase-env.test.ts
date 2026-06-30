import { afterEach, describe, expect, it } from "vitest";
import { getSupabaseEnv, getSupabaseServiceRoleEnv } from "@/lib/supabase/env";

describe("Supabase environment helpers", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns the required public Supabase values when present", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    expect(getSupabaseEnv()).toEqual({
      url: "https://example.supabase.co",
      anonKey: "anon-key",
    });
  });

  it("throws a useful error when the service role key is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => getSupabaseServiceRoleEnv()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });
});

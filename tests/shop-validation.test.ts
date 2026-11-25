import { describe, expect, it } from "vitest";
import { shopSettingsSchema, socialLinkSchema } from "../src/lib/validation/shop";

describe("shop settings validation", () => {
  it("accepts the agreed public shop fields and normalizes whitespace", () => {
    const result = shopSettingsSchema.safeParse({ name: "  Toy Shop  ", phone: null });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Toy Shop");
  });

  it("rejects empty updates and unknown fields", () => {
    expect(shopSettingsSchema.safeParse({}).success).toBe(false);
    expect(shopSettingsSchema.safeParse({ name: "Shop", isAdmin: true }).success).toBe(false);
  });
});

describe("social link validation", () => {
  it("accepts secure links", () => {
    expect(socialLinkSchema.safeParse({ platform: "Instagram", url: "https://example.com/shop" }).success).toBe(true);
  });

  it("rejects insecure and unsupported URLs", () => {
    expect(socialLinkSchema.safeParse({ platform: "Instagram", url: "http://example.com" }).success).toBe(false);
    expect(socialLinkSchema.safeParse({ platform: "Instagram", url: "javascript:alert(1)" }).success).toBe(false);
  });
});

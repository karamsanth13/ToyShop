import { describe, expect, it } from "vitest";
import { shopDetailsSchema, socialLinkSchema } from "../server/validation/shop.js";

describe("shop settings validation", () => {
  it("accepts configured shop details and trims whitespace", () => {
    const result = shopDetailsSchema.safeParse({ name: "  Toy Shop  ", phone: null });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Toy Shop");
  });
  it("rejects unknown fields and unsafe social URLs", () => {
    expect(shopDetailsSchema.safeParse({ name: "Shop", isAdmin: true }).success).toBe(false);
    expect(socialLinkSchema.safeParse({ platform: "Instagram", url: "https://example.com/shop" }).success).toBe(true);
    expect(socialLinkSchema.safeParse({ platform: "Instagram", url: "javascript:alert(1)" }).success).toBe(false);
  });
});

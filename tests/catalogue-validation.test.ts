import { describe, expect, it } from "vitest";
import { isOfferActive, offerInputSchema, productInputSchema, productQuerySchema } from "../src/features/catalogue/validation";

describe("catalogue validation", () => {
  it("accepts decimal-string product prices and out-of-stock visibility fields", () => {
    const parsed = productInputSchema.safeParse({
      name: "Wooden train", slug: "wooden-train", categoryId: null, price: "12.50",
      images: [], description: null, availability: "out_of_stock", isPublished: true,
      isRare: false, isNew: false, isRecommended: false,
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects floating point prices and invalid offer windows", () => {
    expect(productInputSchema.safeParse({ name: "x", slug: "x", categoryId: null, price: 12.5,
      images: [], description: null, availability: "in_stock", isPublished: true,
      isRare: false, isNew: false, isRecommended: false }).success).toBe(false);
    expect(offerInputSchema.safeParse({ title: "Sale", description: null,
      startsAt: "2026-11-26T00:00:00Z", endsAt: "2026-11-25T00:00:00Z",
      isPublished: true, productIds: ["00000000-0000-4000-8000-000000000001"] }).success).toBe(false);
  });

  it("accepts and bounds product search parameters", () => {
    expect(productQuerySchema.parse({ q: "train", limit: "12" }).limit).toBe(12);
    expect(productQuerySchema.safeParse({ limit: "1000" }).success).toBe(false);
  });

  it("uses a start-inclusive, end-exclusive offer window", () => {
    const offer = { startsAt: "2026-11-25T10:00:00Z", endsAt: "2026-11-26T10:00:00Z" };
    expect(isOfferActive(offer, new Date("2026-11-25T10:00:00Z"))).toBe(true);
    expect(isOfferActive(offer, new Date("2026-11-26T10:00:00Z"))).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { isOfferActive, offerInputSchema, productInputSchema, productQuerySchema } from "../server/validation/catalogue.js";

describe("catalogue validation", () => {
  it("accepts decimal strings and out-of-stock products", () => {
    expect(productInputSchema.safeParse({ name: "Wooden train", slug: "wooden-train", categoryId: null, price: "12.50", images: [], description: null, availability: "out_of_stock", isPublished: true, isRare: false, isNew: false, isRecommended: false }).success).toBe(true);
  });
  it("rejects floating point prices and reversed offer dates", () => {
    expect(productInputSchema.safeParse({ name: "Train", slug: "train", categoryId: null, price: 12.5, images: [], description: null, availability: "in_stock", isPublished: true, isRare: false, isNew: false, isRecommended: false }).success).toBe(false);
    expect(offerInputSchema.safeParse({ title: "Sale", description: null, startsAt: "2026-11-26T00:00:00Z", endsAt: "2026-11-25T00:00:00Z", isPublished: true, productIds: [] }).success).toBe(false);
  });
  it("bounds product search and uses start-inclusive, end-exclusive offer windows", () => {
    expect(productQuerySchema.parse({ q: "train", limit: "12" }).limit).toBe(12);
    expect(productQuerySchema.safeParse({ limit: "1000" }).success).toBe(false);
    const offer = { startsAt: "2026-11-25T10:00:00Z", endsAt: "2026-11-26T10:00:00Z" };
    expect(isOfferActive(offer, new Date(offer.startsAt))).toBe(true);
    expect(isOfferActive(offer, new Date(offer.endsAt))).toBe(false);
  });
});

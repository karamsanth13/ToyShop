import { describe, expect, it } from "vitest";
import { buildProductPayload } from "../client/src/admin/product-payload.js";
import { productSchema } from "../server/validation/management.js";

describe("Admin product edit payload", () => {
  it("strips response-only fields so strict API validation accepts edits", () => {
    const responseProduct = {
      id: "9b5890e4-a326-4b20-974d-86e4bdc83ffd",
      name: "Wooden Train",
      slug: "wooden-train",
      categoryId: "496274b4-f157-4d78-bef8-067fd3884cd5",
      category: { name: "Building Blocks", slug: "building-blocks" },
      price: "21.00",
      images: ["/toy-images/train.svg"],
      description: "A wooden toy train.",
      ageGroup: "3–8 years",
      stockQuantity: 4,
      availability: "in_stock",
      isPublished: true,
      isRare: false,
      isNew: false,
      isRecommended: true,
      isBestSeller: true,
      createdAt: "2026-11-26T00:00:00.000Z",
      updatedAt: "2026-11-26T00:00:00.000Z",
    };

    const payload = buildProductPayload(responseProduct);

    expect(productSchema.safeParse(payload).success).toBe(true);
    expect(payload).not.toHaveProperty("id");
    expect(payload).not.toHaveProperty("category");
    expect(payload).not.toHaveProperty("availability");
    expect(payload).not.toHaveProperty("createdAt");
    expect(payload).not.toHaveProperty("updatedAt");
  });
});

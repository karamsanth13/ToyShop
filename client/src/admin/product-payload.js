function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function buildProductPayload(product) {
  return {
    name: product.name,
    slug: product.slug || slugify(product.name),
    categoryId: product.categoryId || null,
    price: String(product.price),
    images: Array.isArray(product.images) ? product.images : [],
    description: product.description || null,
    ageGroup: product.ageGroup || null,
    stockQuantity: Number(product.stockQuantity),
    isPublished: Boolean(product.isPublished),
    isRare: Boolean(product.isRare),
    isNew: Boolean(product.isNew),
    isRecommended: Boolean(product.isRecommended),
    isBestSeller: Boolean(product.isBestSeller),
  };
}

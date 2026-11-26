import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";

const router = Router();
const querySchema = z.object({
  q: z.string().trim().max(120).optional(), category: z.string().trim().max(120).optional(),
  flag: z.enum(["isNew", "isRare", "isRecommended", "isBestSeller"]).optional(),
  availability: z.enum(["in_stock", "out_of_stock"]).optional(), ageGroup: z.string().trim().max(40).optional(),
  minPrice: z.coerce.number().min(0).optional(), maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(["relevance", "price-asc", "price-desc", "newest", "name"]).default("relevance"),
  limit: z.coerce.number().int().min(1).max(60).default(24), cursor: z.string().uuid().optional(), ids: z.string().optional(),
}).refine((query) => query.minPrice === undefined || query.maxPrice === undefined || query.minPrice <= query.maxPrice, { path: ["maxPrice"], message: "Maximum price must be at least the minimum price." });

const productFields = { id: true, name: true, slug: true, categoryId: true, price: true, images: true, description: true, ageGroup: true, availability: true, isRare: true, isNew: true, isRecommended: true, isBestSeller: true, createdAt: true, category: { select: { id: true, name: true, slug: true } } };
function publicProductSelect(now) { return { ...productFields, offerProducts: { where: { offer: { isPublished: true, startsAt: { lte: now }, endsAt: { gt: now } } }, select: { offer: { select: { id: true, title: true, discountPercent: true, endsAt: true } } } } }; }
function presentProduct(product) {
  const offer = product.offerProducts?.map((item) => item.offer).sort((a, b) => b.discountPercent - a.discountPercent)[0] || null;
  return { ...product, price: product.price.toFixed(2), discountedPrice: offer ? product.price.mul(100 - offer.discountPercent).div(100).toFixed(2) : null, activeOffer: offer, offerProducts: undefined };
}
const publicWhere = { isPublished: true };

router.get("/categories", async (_req, res, next) => { try { const categories = await prisma.category.findMany({ where: { isPublished: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }); res.json({ data: { categories } }); } catch (error) { next(error); } });
router.get("/categories/:slug", async (req, res, next) => {
  try {
    const category = await prisma.category.findFirst({ where: { slug: req.params.slug, isPublished: true } });
    if (!category) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Category not found." } });
    const now = new Date();
    const products = await prisma.product.findMany({ where: { ...publicWhere, categoryId: category.id }, select: publicProductSelect(now), orderBy: [{ isNew: "desc" }, { name: "asc" }] });
    const enriched = products.map(presentProduct);
    res.json({ data: { category, products: enriched } });
  } catch (error) { next(error); }
});
router.get("/offers", async (_req, res, next) => {
  try {
    const now = new Date();
    const offers = await prisma.offer.findMany({ where: { isPublished: true, startsAt: { lte: now }, endsAt: { gt: now } }, include: { products: { where: { product: { isPublished: true } }, include: { product: { select: publicProductSelect(now) } } } }, orderBy: { endsAt: "asc" } });
    res.json({ data: { offers: offers.map((offer) => ({ ...offer, products: offer.products.map(({ product }) => ({ product: presentProduct(product), discountPercent: offer.discountPercent })) })) } });
  } catch (error) { next(error); }
});
router.get("/products", async (req, res, next) => {
  try {
    const query = querySchema.parse(req.query);
    const where = {
      ...publicWhere,
      ...(query.q ? { OR: [{ name: { contains: query.q, mode: "insensitive" } }, { description: { contains: query.q, mode: "insensitive" } }] } : {}),
      ...(query.category ? { category: { slug: query.category, isPublished: true } } : {}),
      ...(query.flag ? { [query.flag]: true } : {}), ...(query.availability ? { availability: query.availability } : {}),
      ...(query.ageGroup ? { ageGroup: query.ageGroup } : {}),
      ...(query.minPrice !== undefined || query.maxPrice !== undefined ? { price: { ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}), ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}) } } : {}),
      ...(query.ids ? { id: { in: query.ids.split(",").filter((id) => z.string().uuid().safeParse(id).success) } } : {}),
    };
    const ordering = { relevance: [{ isRecommended: "desc" }, { isNew: "desc" }, { createdAt: "desc" }], "price-asc": [{ price: "asc" }], "price-desc": [{ price: "desc" }], newest: [{ createdAt: "desc" }], name: [{ name: "asc" }] }[query.sort];
    const now = new Date();
    const products = await prisma.product.findMany({ where, select: publicProductSelect(now), orderBy: ordering, take: query.limit, ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}) });
    const enriched = products.map(presentProduct);
    res.json({ data: { products: enriched, nextCursor: products.length === query.limit ? products.at(-1).id : null } });
  } catch (error) { next(error); }
});
router.get("/products/:slug", async (req, res, next) => {
  try {
    const now = new Date();
    const product = await prisma.product.findFirst({ where: { slug: req.params.slug, ...publicWhere }, select: publicProductSelect(now) });
    if (!product) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Product not found." } });
    const related = await prisma.product.findMany({ where: { ...publicWhere, categoryId: product.categoryId, id: { not: product.id } }, select: publicProductSelect(now), take: 4, orderBy: { isRecommended: "desc" } });
    res.json({ data: { product: presentProduct(product), relatedProducts: related.map(presentProduct) } });
  } catch (error) { next(error); }
});
export default router;

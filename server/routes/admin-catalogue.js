import { Router } from "express";
import multer from "multer";
import { prisma } from "../db/prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { productSchema, categorySchema, offerSchema } from "../validation/management.js";
import { recordActivity } from "../services/activity.js";
import { uploadImage } from "../services/cloudinary.js";

const router = Router();
router.use(requireAdmin);
const imageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, done) => done(null, ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.mimetype)) });
const productFields = { id: true, name: true, slug: true, categoryId: true, price: true, images: true, description: true, ageGroup: true, stockQuantity: true, availability: true, isPublished: true, isRare: true, isNew: true, isRecommended: true, isBestSeller: true, createdAt: true, updatedAt: true, category: { select: { name: true, slug: true } } };
const adminProductPayload = (data) => ({ ...data, availability: data.stockQuantity > 0 ? "in_stock" : "out_of_stock" });

router.get("/products", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();
    const products = await prisma.product.findMany({ where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }] } : {}, select: productFields, orderBy: { updatedAt: "desc" }, take: 300 });
    res.json({ data: { products } });
  } catch (error) { next(error); }
});
router.post("/products", async (req, res, next) => {
  try { const input = adminProductPayload(productSchema.parse(req.body)); const product = await prisma.product.create({ data: input, select: productFields }); await recordActivity(req, "Created product", "product", product.id, product.name); res.status(201).json({ data: { product } }); }
  catch (error) { next(error); }
});
router.patch("/products/:id", async (req, res, next) => {
  try { const input = adminProductPayload(productSchema.parse(req.body)); const product = await prisma.product.update({ where: { id: req.params.id }, data: input, select: productFields }); await recordActivity(req, "Updated product", "product", product.id, product.name); res.json({ data: { product } }); }
  catch (error) { next(error); }
});
router.delete("/products/:id", async (req, res, next) => {
  try { const product = await prisma.product.findUnique({ where: { id: req.params.id }, select: { id: true, name: true } }); if (!product) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Product not found." } }); await prisma.product.delete({ where: { id: product.id } }); await recordActivity(req, "Deleted product", "product", product.id, product.name); res.status(204).end(); }
  catch (error) { next(error); }
});
router.post("/products/images", imageUpload.single("image"), async (req, res, next) => {
  try { if (!req.file) return res.status(400).json({ error: { code: "INVALID_IMAGE", message: "Choose a supported image under 5 MB." } }); const image = await uploadImage(req.file.buffer, "toyshop/products"); res.status(201).json({ data: { url: image.secure_url, publicId: image.public_id } }); }
  catch (error) { next(error); }
});

router.get("/categories", async (_req, res, next) => { try { const categories = await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }); res.json({ data: { categories } }); } catch (error) { next(error); } });
router.post("/categories", async (req, res, next) => { try { const category = await prisma.category.create({ data: categorySchema.parse(req.body) }); await recordActivity(req, "Created category", "category", category.id, category.name); res.status(201).json({ data: { category } }); } catch (error) { next(error); } });
router.patch("/categories/:id", async (req, res, next) => { try { const category = await prisma.category.update({ where: { id: req.params.id }, data: categorySchema.parse(req.body) }); await recordActivity(req, "Updated category", "category", category.id, category.name); res.json({ data: { category } }); } catch (error) { next(error); } });
router.delete("/categories/:id", async (req, res, next) => { try { const count = await prisma.product.count({ where: { categoryId: req.params.id } }); if (count) return res.status(409).json({ error: { code: "CATEGORY_HAS_PRODUCTS", message: "Move or delete this category's products before removing it." } }); const category = await prisma.category.delete({ where: { id: req.params.id } }); await recordActivity(req, "Deleted category", "category", category.id, category.name); res.status(204).end(); } catch (error) { next(error); } });

const saveOffer = async (req, data, id) => {
  const { productIds, ...offerData } = offerSchema.parse(data);
  return prisma.$transaction(async (tx) => {
    const offer = id
      ? await tx.offer.update({ where: { id }, data: offerData })
      : await tx.offer.create({ data: offerData });
    await tx.offerProduct.deleteMany({ where: { offerId: offer.id } });
    await tx.offerProduct.createMany({ data: productIds.map((productId) => ({ offerId: offer.id, productId })) });
    await tx.adminActivity.create({ data: { adminId: req.user.id, action: id ? "Updated offer" : "Created offer", targetType: "offer", targetId: offer.id, details: offer.title } });
    return tx.offer.findUnique({ where: { id: offer.id }, include: { products: { include: { product: { select: { id: true, name: true, slug: true } } } } } });
  });
};
router.get("/offers", async (_req, res, next) => { try { const offers = await prisma.offer.findMany({ include: { products: { include: { product: { select: { id: true, name: true, slug: true } } } } }, orderBy: { startsAt: "desc" } }); res.json({ data: { offers } }); } catch (error) { next(error); } });
router.post("/offers", async (req, res, next) => { try { res.status(201).json({ data: { offer: await saveOffer(req, req.body, null) } }); } catch (error) { next(error); } });
router.patch("/offers/:id", async (req, res, next) => { try { res.json({ data: { offer: await saveOffer(req, req.body, req.params.id) } }); } catch (error) { next(error); } });
router.delete("/offers/:id", async (req, res, next) => { try { const offer = await prisma.offer.delete({ where: { id: req.params.id } }); await recordActivity(req, "Deleted offer", "offer", offer.id, offer.title); res.status(204).end(); } catch (error) { next(error); } });

export default router;

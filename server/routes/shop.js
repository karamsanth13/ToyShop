import { Router } from "express";
import multer from "multer";
import { prisma } from "../db/prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { shopDetailsSchema, socialLinkSchema } from "../validation/shop.js";
import { uploadShopLogo } from "../services/cloudinary.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, done) => done(null, ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.mimetype)) });

router.get("/", async (_req, res, next) => {
  try { const [shop, socialLinks] = await Promise.all([prisma.shopDetails.findUnique({ where: { id: 1 } }), prisma.socialLink.findMany({ orderBy: [{ sortOrder: "asc" }, { platform: "asc" }] })]); res.json({ data: { shop, socialLinks } }); } catch (error) { next(error); }
});
router.patch("/", requireAdmin, async (req, res, next) => {
  try { const data = shopDetailsSchema.parse(req.body); const shop = await prisma.shopDetails.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data }); res.json({ data: { shop } }); } catch (error) { next(error); }
});
router.patch("/shop", requireAdmin, async (req, res, next) => { try { const data = shopDetailsSchema.parse(req.body); const shop = await prisma.shopDetails.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data }); res.json({ data: { shop } }); } catch (error) { next(error); } });
router.post("/logo", requireAdmin, upload.single("logo"), async (req, res, next) => {
  try { if (!req.file) return res.status(400).json({ error: { code: "INVALID_IMAGE", message: "Choose a JPG, PNG, WebP, or AVIF image." } }); const result = await uploadShopLogo(req.file.buffer); const shop = await prisma.shopDetails.upsert({ where: { id: 1 }, create: { id: 1, logoUrl: result.secure_url, logoPublicId: result.public_id }, update: { logoUrl: result.secure_url, logoPublicId: result.public_id } }); res.json({ data: { shop } }); } catch (error) { next(error); }
});
router.post("/shop/logo", requireAdmin, upload.single("logo"), async (req, res, next) => { try { if (!req.file) return res.status(400).json({ error: { code: "INVALID_IMAGE", message: "Choose a JPG, PNG, WebP, or AVIF image." } }); const result = await uploadShopLogo(req.file.buffer); const shop = await prisma.shopDetails.upsert({ where: { id: 1 }, create: { id: 1, logoUrl: result.secure_url, logoPublicId: result.public_id }, update: { logoUrl: result.secure_url, logoPublicId: result.public_id } }); res.json({ data: { shop } }); } catch (error) { next(error); } });
router.post("/social-links", requireAdmin, async (req, res, next) => { try { const socialLink = await prisma.socialLink.create({ data: socialLinkSchema.parse(req.body) }); res.status(201).json({ data: { socialLink } }); } catch (error) { next(error); } });
router.patch("/social-links/:id", requireAdmin, async (req, res, next) => { try { const socialLink = await prisma.socialLink.update({ where: { id: req.params.id }, data: socialLinkSchema.parse(req.body) }); res.json({ data: { socialLink } }); } catch (error) { next(error); } });
router.delete("/social-links/:id", requireAdmin, async (req, res, next) => { try { await prisma.socialLink.delete({ where: { id: req.params.id } }); res.status(204).end(); } catch (error) { next(error); } });
export default router;

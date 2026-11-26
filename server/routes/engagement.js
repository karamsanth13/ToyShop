import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { requireAdmin } from "../middleware/auth.js";
import { publicWriteLimit } from "../middleware/public-write-limit.js";
import { recordActivity } from "../services/activity.js";
import { bookingSchema, enquirySchema, enquiryStatusSchema, statusSchema, subscriberSchema } from "../validation/management.js";

const router = Router();
const safeBooking = { id: true, customerName: true, phone: true, email: true, message: true, status: true, createdAt: true, updatedAt: true, product: { select: { id: true, name: true, slug: true, availability: true } } };
router.post("/prebookings", publicWriteLimit, async (req, res, next) => {
  try {
    const input = bookingSchema.parse(req.body);
    const product = await prisma.product.findFirst({ where: { id: input.productId, isPublished: true } });
    if (!product) return res.status(404).json({ error: { code: "PRODUCT_NOT_FOUND", message: "That toy is no longer available for requests." } });
    const preBooking = await prisma.preBooking.create({ data: { productId: input.productId, customerName: input.customerName, phone: input.phone, email: input.email || null, message: input.message || null }, select: { id: true, status: true, createdAt: true } });
    res.status(201).json({ data: { preBooking, message: "Your request is saved. The shop will contact you about availability; this is not an online purchase." } });
  } catch (error) { next(error); }
});
router.get("/prebookings", requireAdmin, async (req, res, next) => { try { const q = String(req.query.q || "").trim(); const preBookings = await prisma.preBooking.findMany({ where: q ? { OR: [{ customerName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }, { product: { name: { contains: q, mode: "insensitive" } } }] } : {}, select: safeBooking, orderBy: { createdAt: "desc" }, take: 300 }); res.json({ data: { preBookings } }); } catch (error) { next(error); } });
router.patch("/prebookings/:id", requireAdmin, async (req, res, next) => { try { const input = statusSchema.parse(req.body); const preBooking = await prisma.preBooking.update({ where: { id: req.params.id }, data: input, select: safeBooking }); await recordActivity(req, "Updated pre-booking", "pre-booking", preBooking.id, input.status); res.json({ data: { preBooking } }); } catch (error) { next(error); } });

router.post("/enquiries", publicWriteLimit, async (req, res, next) => {
  try {
    const input = enquirySchema.parse(req.body);
    if (input.productId && !(await prisma.product.findFirst({ where: { id: input.productId, isPublished: true }, select: { id: true } }))) return res.status(404).json({ error: { code: "PRODUCT_NOT_FOUND", message: "That toy is no longer available." } });
    const enquiry = await prisma.enquiry.create({ data: { customerName: input.customerName, email: input.email || null, phone: input.phone || null, productId: input.productId || null, message: input.message }, select: { id: true, createdAt: true } });
    res.status(201).json({ data: { enquiry, message: "Thanks. Your enquiry has been sent to the shop." } });
  } catch (error) { next(error); }
});
router.get("/enquiries", requireAdmin, async (_req, res, next) => { try { const enquiries = await prisma.enquiry.findMany({ include: { product: { select: { id: true, name: true, slug: true } } }, orderBy: { createdAt: "desc" }, take: 300 }); res.json({ data: { enquiries } }); } catch (error) { next(error); } });
router.patch("/enquiries/:id", requireAdmin, async (req, res, next) => { try { const input = enquiryStatusSchema.parse(req.body); const enquiry = await prisma.enquiry.update({ where: { id: req.params.id }, data: input }); await recordActivity(req, "Updated enquiry", "enquiry", enquiry.id, input.status); res.json({ data: { enquiry } }); } catch (error) { next(error); } });

router.post("/subscriptions", publicWriteLimit, async (req, res, next) => {
  try {
    const input = subscriberSchema.parse(req.body);
    const email = input.email.toLowerCase();
    const subscriber = await prisma.notificationSubscriber.upsert({ where: { email }, create: { email, consentedAt: new Date() }, update: { isActive: true } });
    res.status(200).json({ data: { subscribed: subscriber.isActive, message: "Subscription saved. Email notifications are not being sent until a delivery provider is configured." } });
  } catch (error) { next(error); }
});
router.get("/subscriptions", requireAdmin, async (_req, res, next) => { try { const subscribers = await prisma.notificationSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 500 }); res.json({ data: { subscribers } }); } catch (error) { next(error); } });
router.patch("/subscriptions/:id", requireAdmin, async (req, res, next) => { try { const { isActive } = z.object({ isActive: z.boolean() }).strict().parse(req.body); const subscriber = await prisma.notificationSubscriber.update({ where: { id: req.params.id }, data: { isActive } }); await recordActivity(req, isActive ? "Reactivated subscriber" : "Unsubscribed email", "subscription", subscriber.id); res.json({ data: { subscriber } }); } catch (error) { next(error); } });

router.get("/admin/dashboard", requireAdmin, async (_req, res, next) => {
  try {
    const [products, publishedProducts, categories, pendingBookings, openEnquiries, activeOffers, subscribers, admins, recentActivity] = await Promise.all([
      prisma.product.count(), prisma.product.count({ where: { isPublished: true } }), prisma.category.count(),
      prisma.preBooking.count({ where: { status: "Pending" } }), prisma.enquiry.count({ where: { status: { in: ["New", "Read"] } } }),
      prisma.offer.count({ where: { isPublished: true, startsAt: { lte: new Date() }, endsAt: { gt: new Date() } } }),
      prisma.notificationSubscriber.count({ where: { isActive: true } }), prisma.adminProfile.count({ where: { role: "Admin", isActive: true } }),
      prisma.adminActivity.findMany({ include: { admin: { select: { fullName: true, username: true } } }, orderBy: { createdAt: "desc" }, take: 8 }),
    ]);
    res.json({ data: { stats: { products, publishedProducts, categories, pendingBookings, openEnquiries, activeOffers, subscribers, admins }, recentActivity } });
  } catch (error) { next(error); }
});
router.get("/admin/activity", requireAdmin, async (req, res, next) => { try { if (req.user.role !== "Super Admin") return res.status(403).json({ error: { code: "FORBIDDEN", message: "Super Admin access is required." } }); const activities = await prisma.adminActivity.findMany({ include: { admin: { select: { fullName: true, username: true } } }, orderBy: { createdAt: "desc" }, take: 500 }); res.json({ data: { activities } }); } catch (error) { next(error); } });
export default router;

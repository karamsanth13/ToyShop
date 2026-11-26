import { z } from "zod";

const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120);
const nullableText = (max) => z.string().trim().max(max).nullable().optional();
export const productSchema = z.object({
  name: z.string().trim().min(1).max(160), slug, categoryId: z.string().uuid().nullable().optional(),
  price: z.string().regex(/^\d{1,8}(\.\d{1,2})?$/), images: z.array(z.union([z.string().url().max(2048), z.string().regex(/^\/toy-images\/[a-z0-9-]+\.svg$/)])).max(8),
  description: nullableText(10000), ageGroup: nullableText(40), stockQuantity: z.number().int().min(0).max(100000),
  isPublished: z.boolean(), isRare: z.boolean(), isNew: z.boolean(), isRecommended: z.boolean(), isBestSeller: z.boolean(),
}).strict();
export const categorySchema = z.object({ name: z.string().trim().min(1).max(100), slug, description: nullableText(1000), sortOrder: z.number().int().min(0).max(10000), isPublished: z.boolean() }).strict();
export const offerSchema = z.object({ title: z.string().trim().min(1).max(160), description: nullableText(2000), discountPercent: z.number().int().min(1).max(90), startsAt: z.string().datetime(), endsAt: z.string().datetime(), isPublished: z.boolean(), productIds: z.array(z.string().uuid()).min(1).max(100) }).strict().refine((offer) => new Date(offer.endsAt) > new Date(offer.startsAt), { path: ["endsAt"], message: "Offer end must be after its start." });
export const bookingSchema = z.object({ productId: z.string().uuid(), customerName: z.string().trim().min(2).max(120), phone: z.string().trim().min(5).max(40), email: z.union([z.string().email().max(254), z.literal("")]).optional(), message: nullableText(1000), consent: z.literal(true) }).strict();
export const enquirySchema = z.object({ customerName: z.string().trim().min(2).max(120), email: z.union([z.string().email().max(254), z.literal("")]).optional(), phone: z.string().trim().max(40).optional(), productId: z.string().uuid().optional(), message: z.string().trim().min(10).max(2000), consent: z.literal(true) }).strict();
export const subscriberSchema = z.object({ email: z.string().trim().email().max(254), consent: z.literal(true) }).strict();
export const statusSchema = z.object({ status: z.enum(["Pending", "Contacted", "Confirmed", "Rejected"]) }).strict();
export const enquiryStatusSchema = z.object({ status: z.enum(["New", "Read", "Resolved"]) }).strict();
export const adminAccountSchema = z.object({ fullName: z.string().trim().min(1).max(120), username: z.string().trim().regex(/^[a-zA-Z0-9_.-]{3,40}$/), email: z.union([z.string().email().max(254), z.literal("")]).optional(), password: z.string().min(8).max(200) }).strict();

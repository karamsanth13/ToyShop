import { z } from "zod";

const uuid = z.string().uuid();
const decimalPrice = z.string().regex(/^\d{1,8}(\.\d{1,2})?$/, "Enter a price with up to two decimal places.");
export const productInputSchema = z.object({
  name: z.string().trim().min(1).max(160), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  categoryId: uuid.nullable(), price: decimalPrice, images: z.array(z.string().url().max(2048)).max(12),
  description: z.string().max(10000).nullable(), availability: z.enum(["in_stock", "out_of_stock"]),
  isPublished: z.boolean(), isRare: z.boolean(), isNew: z.boolean(), isRecommended: z.boolean(),
}).strict();
export const productQuerySchema = z.object({ q: z.string().trim().max(120).optional(), category: z.string().trim().max(120).optional(), flag: z.enum(["isNew", "isRare", "isRecommended"]).optional(), limit: z.coerce.number().int().min(1).max(60).default(24), cursor: uuid.optional() });
export const offerInputSchema = z.object({ title: z.string().trim().min(1).max(160), description: z.string().max(2000).nullable(), startsAt: z.string().datetime(), endsAt: z.string().datetime(), isPublished: z.boolean(), productIds: z.array(uuid).max(100) }).strict().refine((offer) => new Date(offer.endsAt) > new Date(offer.startsAt), { path: ["endsAt"], message: "Offer end must be after its start." });
export function isOfferActive(offer, now = new Date()) { return new Date(offer.startsAt) <= now && now < new Date(offer.endsAt); }

import { z } from "zod";

const slugSchema = z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const imageSchema = z.string().url().max(2048);
export const productInputSchema = z.object({
  name: z.string().trim().min(1).max(160), slug: slugSchema,
  categoryId: z.string().uuid().nullable(), price: z.string().regex(/^\d{1,8}(?:\.\d{1,2})?$/),
  images: z.array(imageSchema).max(8), description: z.string().trim().max(5000).nullable(),
  availability: z.enum(["in_stock", "out_of_stock"]),
  isPublished: z.boolean(), isRare: z.boolean(), isNew: z.boolean(), isRecommended: z.boolean(),
});
export const categoryInputSchema = z.object({
  name: z.string().trim().min(1).max(100), slug: slugSchema,
  description: z.string().trim().max(1000).nullable(), sortOrder: z.number().int().min(0).max(10000),
});
export const offerInputSchema = z.object({
  title: z.string().trim().min(1).max(160), description: z.string().trim().max(2000).nullable(),
  startsAt: z.string().datetime({ offset: true }), endsAt: z.string().datetime({ offset: true }),
  isPublished: z.boolean(), productIds: z.array(z.string().uuid()).min(1).max(100),
}).refine((value) => Date.parse(value.endsAt) > Date.parse(value.startsAt), {
  path: ["endsAt"], message: "End date must be after start date.",
});
export const productQuerySchema = z.object({
  q: z.string().trim().max(120).optional(), category: slugSchema.optional(),
  limit: z.coerce.number().int().min(1).max(48).default(24),
  cursor: z.string().uuid().optional(),
});

export const isOfferActive = (offer: { startsAt: string; endsAt: string }, now = new Date()) =>
  Date.parse(offer.startsAt) <= now.getTime() && now.getTime() < Date.parse(offer.endsAt);

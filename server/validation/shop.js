import { z } from "zod";

const optionalText = (max) => z.string().trim().max(max).nullable().optional();
export const shopDetailsSchema = z.object({
  name: optionalText(160), description: optionalText(2000), address: optionalText(500),
  mapLocation: optionalText(2048), phone: optionalText(40), whatsappNumber: optionalText(40), email: z.union([z.string().trim().email().max(254), z.literal(""), z.null()]).optional(),
}).strict();
export const socialLinkSchema = z.object({
  platform: z.enum(["Instagram", "Facebook", "YouTube", "TikTok", "Other"]),
  url: z.string().url().max(2048).refine((value) => value.startsWith("https://"), "Use a secure HTTPS link."), label: optionalText(80), sortOrder: z.number().int().min(0).max(10000).optional(),
}).strict();

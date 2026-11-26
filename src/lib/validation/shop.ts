import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).nullable();

export const shopSettingsSchema = z.object({
  name: optionalText(160),
  description: optionalText(2000),
  logoPath: z.string().trim().max(1024).nullable(),
  address: optionalText(500),
  mapLocation: z.string().trim().max(2048).nullable(),
  phone: optionalText(40),
  whatsappNumber: optionalText(40),
  email: z.email().max(254).nullable().or(z.literal("")),
  openingHours: optionalText(1000),
}).partial().strict().refine((value) => Object.keys(value).length > 0, "At least one shop field is required.");

export const socialLinkSchema = z.object({
  platform: z.enum(["Instagram", "Facebook", "YouTube", "TikTok", "Other"]),
  url: z.url().max(2048).refine((value) => value.startsWith("https://"), "Use a secure HTTPS URL."),
  label: z.string().trim().max(80).nullable().optional(),
  sortOrder: z.number().int().min(0).max(10000).optional(),
}).strict();

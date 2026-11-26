import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { requireSuperAdmin } from "../middleware/auth.js";
import { recordActivity } from "../services/activity.js";
import { adminAccountSchema } from "../validation/management.js";

const router = Router();
router.use(requireSuperAdmin);
const publicAdmin = { id: true, fullName: true, username: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true };
router.get("/", async (_req, res, next) => { try { const admins = await prisma.adminProfile.findMany({ where: { role: "Admin" }, select: publicAdmin, orderBy: { createdAt: "asc" } }); res.json({ data: { admins } }); } catch (error) { next(error); } });
router.post("/", async (req, res, next) => {
  try {
    const input = adminAccountSchema.parse(req.body);
    const email = input.email?.trim().toLowerCase() || `${input.username.toLowerCase()}@toyshop.local`;
    const admin = await prisma.adminProfile.create({ data: { fullName: input.fullName, username: input.username.toLowerCase(), email, passwordHash: await bcrypt.hash(input.password, 12), role: "Admin" }, select: publicAdmin });
    await recordActivity(req, "Created admin", "admin", admin.id, `Created ${admin.username}`);
    res.status(201).json({ data: { admin } });
  } catch (error) { next(error); }
});
router.patch("/:id", async (req, res, next) => {
  try {
    const input = z.object({ fullName: z.string().trim().min(1).max(120).optional(), email: z.string().email().max(254).optional(), isActive: z.boolean().optional() }).strict().refine((value) => Object.keys(value).length > 0).parse(req.body);
    const account = await prisma.adminProfile.findUnique({ where: { id: req.params.id } });
    if (!account || account.role !== "Admin") return res.status(404).json({ error: { code: "NOT_FOUND", message: "Admin account not found." } });
    const admin = await prisma.adminProfile.update({ where: { id: account.id }, data: input, select: publicAdmin });
    await recordActivity(req, input.isActive === false ? "Deactivated admin" : "Updated admin", "admin", admin.id, `Updated ${admin.username}`);
    res.json({ data: { admin } });
  } catch (error) { next(error); }
});
router.delete("/:id", async (req, res, next) => {
  try {
    const admin = await prisma.adminProfile.findUnique({ where: { id: req.params.id } });
    if (!admin || admin.role !== "Admin") return res.status(404).json({ error: { code: "NOT_FOUND", message: "Admin account not found." } });
    await prisma.adminProfile.update({ where: { id: admin.id }, data: { isActive: false } });
    await recordActivity(req, "Deactivated admin", "admin", admin.id, `Deactivated ${admin.username}`);
    res.status(204).end();
  } catch (error) { next(error); }
});
export default router;

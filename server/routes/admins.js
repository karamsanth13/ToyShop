import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { requireSuperAdmin } from "../middleware/auth.js";

const router = Router();
const createSchema = z.object({ fullName: z.string().trim().min(1).max(120), email: z.string().trim().email().max(254), password: z.string().min(12).max(200) }).strict();
router.use(requireSuperAdmin);
router.get("/", async (_req, res, next) => { try { const admins = await prisma.adminProfile.findMany({ where: { role: "Admin" }, select: { id: true, fullName: true, email: true, role: true, createdAt: true }, orderBy: { createdAt: "asc" } }); res.json({ data: { admins } }); } catch (error) { next(error); } });
router.post("/", async (req, res, next) => { try { const input = createSchema.parse(req.body); const admin = await prisma.adminProfile.create({ data: { fullName: input.fullName, email: input.email.toLowerCase(), passwordHash: await bcrypt.hash(input.password, 12), role: "Admin" }, select: { id: true, fullName: true, email: true, role: true, createdAt: true } }); res.status(201).json({ data: { admin } }); } catch (error) { next(error); } });
router.delete("/:id", async (req, res, next) => { try { const admin = await prisma.adminProfile.findUnique({ where: { id: req.params.id } }); if (!admin || admin.role !== "Admin") return res.status(404).json({ error: { code: "NOT_FOUND", message: "Admin account not found." } }); await prisma.adminProfile.delete({ where: { id: admin.id } }); res.status(204).end(); } catch (error) { next(error); } });
export default router;

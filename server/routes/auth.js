import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { cookieName, requireAdmin } from "../middleware/auth.js";
import { postgresRateLimitStore } from "../services/rate-limit-store.js";

const router = Router();
const loginSchema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(200) }).strict();
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: "draft-8", legacyHeaders: false, store: postgresRateLimitStore, keyGenerator: (req) => ipKeyGenerator(req.ip || req.socket.remoteAddress || "127.0.0.1"), message: { error: { code: "RATE_LIMITED", message: "Too many sign-in attempts. Try again later." } } });

router.post("/login", loginLimit, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.adminProfile.findUnique({ where: { email: email.toLowerCase() } });
    const valid = user ? await bcrypt.compare(password, user.passwordHash) : await bcrypt.compare(password, "$2b$12$C6UzMDM.H6dfI/f/IKcEe.ou2f2mml5JCa6jUdYj.Yqxq7Ji7W6G2");
    if (!user || !valid) return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect." } });
    const token = jwt.sign({}, process.env.JWT_SECRET, { subject: user.id, expiresIn: "8h", algorithm: "HS256" });
    res.cookie(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 8 * 60 * 60 * 1000, path: "/" });
    res.json({ data: { user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } } });
  } catch (error) { next(error); }
});
router.post("/logout", (_req, res) => { res.clearCookie(cookieName, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" }); res.json({ data: { success: true } }); });
router.get("/me", requireAdmin, async (req, res) => { res.json({ data: { user: req.user } }); });
export default router;

import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma.js";

const cookieName = "toyshop_session";
async function getCurrentUser(req) {
  const token = req.cookies?.[cookieName];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    return await prisma.adminProfile.findUnique({ where: { id: payload.sub }, select: { id: true, fullName: true, email: true, role: true } });
  } catch { return null; }
}

export async function getCurrentUserRole(req) {
  const user = await getCurrentUser(req);
  return user?.role ?? null;
}

export function requireAdmin(req, res, next) {
  getCurrentUser(req).then((user) => {
    if (!user) return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Sign in to continue." } });
    req.user = user;
    next();
  }).catch(next);
}

export function requireSuperAdmin(req, res, next) {
  requireAdmin(req, res, (error) => {
    if (error) return next(error);
    if (req.user.role !== "Super Admin") return res.status(403).json({ error: { code: "FORBIDDEN", message: "Super Admin access is required." } });
    next();
  });
}

export { cookieName };

import { prisma } from "../db/prisma.js";

export function recordActivity(req, action, targetType, targetId = null, details = null) {
  return prisma.adminActivity.create({ data: { adminId: req.user?.id || null, action, targetType, targetId, details } });
}

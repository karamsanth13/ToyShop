import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import { createPostgresRateLimitStore } from "../services/rate-limit-store.js";

export const publicWriteLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  store: createPostgresRateLimitStore(),
  keyGenerator: (req) => `write:${ipKeyGenerator(req.ip || req.socket.remoteAddress || "127.0.0.1")}`,
  message: { error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." } },
});

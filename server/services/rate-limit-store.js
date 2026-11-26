import { createHmac } from "node:crypto";
import { prisma } from "../db/prisma.js";

const secret = process.env.RATE_LIMIT_SECRET;
if (!secret || secret.length < 32) throw new Error("RATE_LIMIT_SECRET must contain at least 32 characters.");

function hashKey(key) {
  return createHmac("sha256", secret).update(key).digest("hex");
}

export const postgresRateLimitStore = {
  localKeys: false,
  init(options) { this.windowMs = options.windowMs; },
  async increment(key) {
    const keyHash = hashKey(key);
    const [row] = await prisma.$queryRaw`
      INSERT INTO "login_rate_limits" ("key_hash", "hits", "reset_at")
      VALUES (${keyHash}, 1, now() + (${this.windowMs}::int * interval '1 millisecond'))
      ON CONFLICT ("key_hash") DO UPDATE SET
        "hits" = CASE WHEN "login_rate_limits"."reset_at" <= now() THEN 1 ELSE "login_rate_limits"."hits" + 1 END,
        "reset_at" = CASE WHEN "login_rate_limits"."reset_at" <= now()
          THEN now() + (${this.windowMs}::int * interval '1 millisecond') ELSE "login_rate_limits"."reset_at" END
      RETURNING "hits", "reset_at"
    `;
    return { totalHits: row.hits, resetTime: row.reset_at };
  },
  async decrement(key) {
    await prisma.$executeRaw`UPDATE "login_rate_limits" SET "hits" = GREATEST("hits" - 1, 0) WHERE "key_hash" = ${hashKey(key)}`;
  },
  async resetKey(key) {
    await prisma.loginRateLimit.deleteMany({ where: { keyHash: hashKey(key) } });
  },
};

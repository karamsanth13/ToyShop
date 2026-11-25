import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export class RateLimitUnavailableError extends Error {}

async function getBucketHash(): Promise<string> {
  const secret = process.env.SUPABASE_RATE_LIMIT_SECRET;
  if (!secret || secret.length < 32) throw new RateLimitUnavailableError("Rate limit is not configured.");
  const headerStore = await headers();
  // Configure the deployment proxy to overwrite these headers; never log or persist the raw address.
  const address = headerStore.get("x-real-ip") ?? headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!address) throw new RateLimitUnavailableError("Trusted client address is unavailable.");
  return createHmac("sha256", secret).update(address).digest("hex");
}

export async function assertLoginNotLimited(): Promise<string> {
  const bucketHash = await getBucketHash();
  const { data, error } = await createAdminClient().rpc("login_bucket_is_limited", { p_bucket_hash: bucketHash });
  if (error) throw new RateLimitUnavailableError("Rate limit service is unavailable.");
  if (data === true) throw new Error("LOGIN_RATE_LIMITED");
  return bucketHash;
}

export async function recordLoginFailure(bucketHash: string): Promise<void> {
  const { error } = await createAdminClient().rpc("record_login_failure", { p_bucket_hash: bucketHash });
  if (error) throw new RateLimitUnavailableError("Rate limit service is unavailable.");
}

export async function clearLoginFailures(bucketHash: string): Promise<void> {
  const { error } = await createAdminClient().rpc("clear_login_failures", { p_bucket_hash: bucketHash });
  if (error) throw new RateLimitUnavailableError("Rate limit service is unavailable.");
}

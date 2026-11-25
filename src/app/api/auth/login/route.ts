import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserRole } from "@/lib/auth/guards";
import { assertLoginNotLimited, clearLoginFailures, RateLimitUnavailableError, recordLoginFailure } from "@/lib/auth/login-rate-limit";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.email().max(254).transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1).max(256),
}).strict();

function error(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 4096) return error("INVALID_REQUEST", "Invalid login request.", 413);
  let payload: unknown;
  try { payload = await request.json(); } catch { return error("INVALID_REQUEST", "Invalid login request.", 400); }
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) return error("INVALID_CREDENTIALS", "Email or password is incorrect.", 400);

  let bucketHash: string;
  try { bucketHash = await assertLoginNotLimited(); }
  catch (cause) {
    if (cause instanceof Error && cause.message === "LOGIN_RATE_LIMITED") {
      return error("RATE_LIMITED", "Too many attempts. Please try again later.", 429);
    }
    if (cause instanceof RateLimitUnavailableError) return error("SERVICE_UNAVAILABLE", "Login is temporarily unavailable.", 503);
    return error("SERVICE_UNAVAILABLE", "Login is temporarily unavailable.", 503);
  }

  const supabase = await createClient();
  const { data, error: signInError } = await supabase.auth.signInWithPassword(parsed.data);
  if (signInError || !data.user) {
    try { await recordLoginFailure(bucketHash); }
    catch { return error("SERVICE_UNAVAILABLE", "Login is temporarily unavailable.", 503); }
    return error("INVALID_CREDENTIALS", "Email or password is incorrect.", 401);
  }

  const role = await getCurrentUserRole();
  if (!role) {
    await supabase.auth.signOut();
    try { await recordLoginFailure(bucketHash); } catch { /* Keep the response generic. */ }
    return error("INVALID_CREDENTIALS", "Email or password is incorrect.", 401);
  }
  try { await clearLoginFailures(bucketHash); }
  catch {
    await supabase.auth.signOut();
    return error("SERVICE_UNAVAILABLE", "Login is temporarily unavailable.", 503);
  }

  return NextResponse.json({ data: { user: { id: data.user.id, email: data.user.email, role } } });
}

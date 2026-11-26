import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/types/database";

export type { AdminRole } from "@/types/database";
export type AuthenticatedAdmin = { userId: string; email: string; role: AdminRole };
export type AuthenticatedSuperAdmin = AuthenticatedAdmin & { role: "Super Admin" };

export class AuthRequiredError extends Error {
  readonly status = 401;
  constructor() { super("Authentication required."); this.name = "AuthRequiredError"; }
}

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor() { super("You do not have permission to perform this action."); this.name = "ForbiddenError"; }
}

export async function getCurrentUserRole(): Promise<AdminRole | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;
    const { data, error } = await supabase
      .from("admin_profiles")
      .select("role")
      .eq("id", user.id).eq("is_active", true)
      .maybeSingle();
    if (error || (data?.role !== "Admin" && data?.role !== "Super Admin")) return null;
    return data.role;
  } catch {
    return null;
  }
}

async function getAuthenticatedAdmin(): Promise<AuthenticatedAdmin> {
  let supabase;
  try { supabase = await createClient(); } catch { throw new AuthRequiredError(); }
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.email) throw new AuthRequiredError();
  const { data, error } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("id", user.id).eq("is_active", true)
    .maybeSingle();
  if (error || (data?.role !== "Admin" && data?.role !== "Super Admin")) throw new ForbiddenError();
  return { userId: user.id, email: user.email, role: data.role };
}

export async function requireAdmin(): Promise<AuthenticatedAdmin> {
  return getAuthenticatedAdmin();
}

export async function requireSuperAdmin(): Promise<AuthenticatedSuperAdmin> {
  const admin = await getAuthenticatedAdmin();
  if (admin.role !== "Super Admin") throw new ForbiddenError();
  return admin as AuthenticatedSuperAdmin;
}

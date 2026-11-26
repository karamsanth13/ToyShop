import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

const accountUpdateSchema = z.object({ fullName: z.string().trim().min(1).max(120).optional(), isActive: z.boolean().optional() })
  .strict().refine((value) => Object.keys(value).length > 0, "At least one account field is required.");

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireSuperAdmin(); }
  catch (cause) {
    const status = cause instanceof Error && "status" in cause ? Number(cause.status) : 500;
    return NextResponse.json({ error: { code: status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN", message: "Super Admin access is required." } }, { status });
  }
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return NextResponse.json({ error: { code: "INVALID_ID", message: "Invalid admin account." } }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } }, { status: 400 }); }
  const parsed = accountUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Check the admin account details and try again." } }, { status: 400 });
  const supabase = createAdminClient();
  const { data: profile, error: lookupError } = await supabase.from("admin_profiles").select("id,role").eq("id", id).maybeSingle();
  if (lookupError || !profile) return NextResponse.json({ error: { code: "ADMIN_NOT_FOUND", message: "Admin account was not found." } }, { status: 404 });
  if (profile.role !== "Admin") return NextResponse.json({ error: { code: "PROTECTED_ACCOUNT", message: "Super Admin accounts cannot be changed here." } }, { status: 409 });
  const update: { full_name?: string; is_active?: boolean } = {};
  if (parsed.data.fullName !== undefined) update.full_name = parsed.data.fullName;
  if (parsed.data.isActive !== undefined) update.is_active = parsed.data.isActive;
  const { data, error } = await supabase.from("admin_profiles").update(update).eq("id", id)
    .select("id,full_name,email,role,is_active,created_at").single();
  if (error) return NextResponse.json({ error: { code: "ADMIN_UPDATE_FAILED", message: "Could not update that admin account." } }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireSuperAdmin(); }
  catch (cause) {
    const status = cause instanceof Error && "status" in cause ? Number(cause.status) : 500;
    return NextResponse.json({ error: { code: status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN", message: "Super Admin access is required." } }, { status });
  }
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return NextResponse.json({ error: { code: "INVALID_ID", message: "Invalid admin account." } }, { status: 400 });
  const supabase = createAdminClient();
  const { data: profile, error: profileError } = await supabase.from("admin_profiles").select("role").eq("id", id).maybeSingle();
  if (profileError || !profile) return NextResponse.json({ error: { code: "ADMIN_NOT_FOUND", message: "Admin account was not found." } }, { status: 404 });
  if (profile.role !== "Admin") return NextResponse.json({ error: { code: "PROTECTED_ACCOUNT", message: "Super Admin accounts cannot be removed here." } }, { status: 409 });
  const { error } = await supabase.from("admin_profiles").update({ is_active: false }).eq("id", id);
  if (error) return NextResponse.json({ error: { code: "ADMIN_DEACTIVATE_FAILED", message: "Could not deactivate that admin account." } }, { status: 500 });
  return NextResponse.json({ data: { deactivated: true } });
}

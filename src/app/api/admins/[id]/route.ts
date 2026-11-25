import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: { code: "ADMIN_DELETE_FAILED", message: "Could not remove that admin account." } }, { status: 500 });
  return NextResponse.json({ data: { deleted: true } });
}

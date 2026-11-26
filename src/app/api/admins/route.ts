import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

const adminSchema = z.object({ fullName: z.string().trim().min(1).max(120), email: z.email().trim().toLowerCase().max(254) }).strict();

function authError(cause: unknown) {
  const status = cause instanceof Error && "status" in cause ? Number(cause.status) : 500;
  return NextResponse.json({ error: { code: status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN", message: "Super Admin access is required." } }, { status });
}

export async function GET() {
  try { await requireSuperAdmin(); } catch (cause) { return authError(cause); }
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("admin_profiles").select("id,full_name,email,role,is_active,created_at").order("created_at");
  if (error) return NextResponse.json({ error: { code: "ADMIN_LIST_FAILED", message: "Could not load admin accounts." } }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  try { await requireSuperAdmin(); } catch (cause) { return authError(cause); }
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } }, { status: 400 }); }
  const parsed = adminSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Enter a valid name and email." } }, { status: 400 });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return NextResponse.json({ error: { code: "INVITE_UNAVAILABLE", message: "Admin invitations are not configured." } }, { status: 503 });
  const supabase = createAdminClient();
  const { data: invite, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(parsed.data.email, {
    redirectTo: `${siteUrl.replace(/\/$/, "")}/auth/callback`, data: { full_name: parsed.data.fullName },
  });
  if (inviteError || !invite.user) return NextResponse.json({ error: { code: "INVITE_FAILED", message: "Could not send an admin invitation. Check the configured email provider." } }, { status: 503 });
  const { error: profileError } = await supabase.from("admin_profiles").insert({
    id: invite.user.id, full_name: parsed.data.fullName, email: parsed.data.email, role: "Admin",
  });
  if (profileError) {
    await supabase.auth.admin.deleteUser(invite.user.id);
    return NextResponse.json({ error: { code: "ADMIN_CREATE_FAILED", message: "Could not create the admin profile." } }, { status: 500 });
  }
  return NextResponse.json({ data: { id: invite.user.id, fullName: parsed.data.fullName, email: parsed.data.email, role: "Admin" } }, { status: 201 });
}

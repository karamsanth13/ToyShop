import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { socialLinkSchema } from "@/lib/validation/shop";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); }
  catch (cause) {
    const status = cause instanceof Error && "status" in cause ? Number(cause.status) : 500;
    return NextResponse.json({ error: { code: status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN", message: "You cannot manage social links." } }, { status });
  }
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return NextResponse.json({ error: { code: "INVALID_ID", message: "Invalid social link." } }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } }, { status: 400 }); }
  const parsed = socialLinkSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Check the social link and try again." } }, { status: 400 });
  const supabase = await createClient();
  const { data, error } = await supabase.from("social_links").update({
    platform: parsed.data.platform, url: parsed.data.url, label: parsed.data.label ?? null, sort_order: parsed.data.sortOrder ?? 0,
  }).eq("id", id).select("id,platform,url,label,sort_order").maybeSingle();
  if (error) return NextResponse.json({ error: { code: "SOCIAL_LINK_UPDATE_FAILED", message: "Could not update that social link." } }, { status: 500 });
  if (!data) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Social link was not found." } }, { status: 404 });
  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); }
  catch (cause) {
    const status = cause instanceof Error && "status" in cause ? Number(cause.status) : 500;
    return NextResponse.json({ error: { code: status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN", message: "You cannot manage social links." } }, { status });
  }
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return NextResponse.json({ error: { code: "INVALID_ID", message: "Invalid social link." } }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.from("social_links").delete().eq("id", id);
  if (error) return NextResponse.json({ error: { code: "SOCIAL_LINK_DELETE_FAILED", message: "Could not remove that social link." } }, { status: 500 });
  return NextResponse.json({ data: { deleted: true } });
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { socialLinkSchema } from "@/lib/validation/shop";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try { await requireAdmin(); }
  catch (cause) {
    const status = cause instanceof Error && "status" in cause ? Number(cause.status) : 500;
    return NextResponse.json({ error: { code: status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN", message: "You cannot manage social links." } }, { status });
  }
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } }, { status: 400 }); }
  const parsed = socialLinkSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Check the social link and try again.", details: parsed.error.flatten() } }, { status: 400 });
  const { sortOrder, ...data } = parsed.data;
  const supabase = await createClient();
  const { data: link, error } = await supabase.from("social_links").insert({
    platform: data.platform, url: data.url, label: data.label ?? null, sort_order: sortOrder ?? 0,
  }).select("id,platform,url,label,sort_order").single();
  if (error) return NextResponse.json({ error: { code: "SOCIAL_LINK_CREATE_FAILED", message: "Could not save that social link." } }, { status: 500 });
  return NextResponse.json({ data: link }, { status: 201 });
}

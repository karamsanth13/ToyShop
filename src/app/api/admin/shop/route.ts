import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { shopSettingsSchema } from "@/lib/validation/shop";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  try { await requireAdmin(); }
  catch (cause) {
    const status = cause instanceof Error && "status" in cause ? Number(cause.status) : 500;
    return NextResponse.json({ error: { code: status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN", message: "You cannot update shop details." } }, { status });
  }
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: { code: "INVALID_JSON", message: "Request body must be valid JSON." } }, { status: 400 }); }
  const parsed = shopSettingsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Check the shop details and try again.", details: parsed.error.flatten() } }, { status: 400 });
  const row = {
    name: parsed.data.name, description: parsed.data.description, logo_path: parsed.data.logoPath,
    address: parsed.data.address, map_location: parsed.data.mapLocation,
    phone: parsed.data.phone, whatsapp_number: parsed.data.whatsappNumber,
    email: parsed.data.email === "" ? null : parsed.data.email,
  };
  const supabase = await createClient();
  const { data, error } = await supabase.from("shop_details").update(row).eq("id", 1)
    .select("name,description,logo_path,address,map_location,phone,whatsapp_number,email,updated_at").single();
  if (error) return NextResponse.json({ error: { code: "SHOP_UPDATE_FAILED", message: "Could not save shop details." } }, { status: 500 });
  return NextResponse.json({ data });
}

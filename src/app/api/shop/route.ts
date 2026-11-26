import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const [{ data: shop, error: shopError }, { data: socialLinks, error: linksError }] = await Promise.all([
      supabase.from("shop_details").select("name,description,logo_path,address,map_location,phone,whatsapp_number,email,opening_hours,updated_at").eq("id", 1).single(),
      supabase.from("social_links").select("id,platform,url,label,sort_order").order("sort_order").order("platform"),
    ]);
    if (shopError || linksError) throw new Error("shop_query_failed");
    return NextResponse.json({ data: { shop, socialLinks } });
  } catch {
    return NextResponse.json({ error: { code: "SHOP_UNAVAILABLE", message: "Shop details are temporarily unavailable." } }, { status: 503 });
  }
}

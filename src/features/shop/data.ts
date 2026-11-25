import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type PublicShop = Pick<Database["public"]["Tables"]["shop_details"]["Row"], "name" | "description" | "logo_path" | "address" | "map_location" | "phone" | "whatsapp_number" | "email">;
export type PublicSocialLink = Pick<Database["public"]["Tables"]["social_links"]["Row"], "id" | "platform" | "url" | "label" | "sort_order">;
export type PublicShopData = { shop: PublicShop | null; socialLinks: PublicSocialLink[] };

export async function getPublicShopData(): Promise<PublicShopData> {
  try {
    const supabase = await createClient();
    const [{ data: shop }, { data: socialLinks }] = await Promise.all([
      supabase.from("shop_details").select("name,description,logo_path,address,map_location,phone,whatsapp_number,email").eq("id", 1).maybeSingle(),
      supabase.from("social_links").select("id,platform,url,label,sort_order").order("sort_order").order("platform"),
    ]);
    return { shop, socialLinks: socialLinks ?? [] };
  } catch {
    return { shop: null, socialLinks: [] };
  }
}

export function getLogoUrl(path: string | null): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !path || !path.startsWith("logo/")) return null;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/shop-assets/${path.split("/").map(encodeURIComponent).join("/")}`;
}

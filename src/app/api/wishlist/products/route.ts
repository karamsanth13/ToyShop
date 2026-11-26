import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product } from "@/types/catalogue";

const fields = "id,name,slug,category_id,price,images,description,availability,is_rare,is_new,is_recommended,created_at,categories(name,slug)";

export async function GET(request: Request) {
  const requestedIds = new URL(request.url).searchParams.get("ids")?.split(",") ?? [];
  const ids = [...new Set(requestedIds)];
  if (ids.length > 48 || ids.some((id) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))) {
    return NextResponse.json({ error: { code: "INVALID_IDS", message: "Wishlist product IDs are invalid.", details: null } }, { status: 400 });
  }
  if (!ids.length) return NextResponse.json({ data: [] });

  const client = await createSupabaseServerClient();
  if (!client) return NextResponse.json({ data: [] });
  const { data, error } = await client.from("products").select(fields).in("id", ids).eq("is_published", true);
  if (error) return NextResponse.json({ error: { code: "CATALOGUE_UNAVAILABLE", message: "Saved toys are temporarily unavailable.", details: null } }, { status: 503 });

  const products: Product[] = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    categoryId: row.category_id,
    category: row.categories as Product["category"],
    price: Number(row.price).toFixed(2),
    images: row.images ?? [],
    description: row.description,
    availability: row.availability,
    isRare: row.is_rare,
    isNew: row.is_new,
    isRecommended: row.is_recommended,
    createdAt: row.created_at,
  }));
  return NextResponse.json({ data: products });
}

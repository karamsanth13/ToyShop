import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category, Offer, Product } from "@/types/catalogue";
import type { Database } from "@/types/database";

type DbProduct = {
  id: string; name: string; slug: string; category_id: string | null; price: number;
  images: string[]; description: string | null; availability: Product["availability"];
  is_rare: boolean; is_new: boolean; is_recommended: boolean; created_at: string;
  categories: { name: string; slug: string } | null;
};

export function toProduct(row: DbProduct): Product {
  return {
    id: row.id, name: row.name, slug: row.slug, categoryId: row.category_id,
    category: row.categories, price: row.price.toFixed(2), images: row.images ?? [],
    description: row.description, availability: row.availability,
    isRare: row.is_rare, isNew: row.is_new, isRecommended: row.is_recommended,
    createdAt: row.created_at,
  };
}

const productFields = "id,name,slug,category_id,price,images,description,availability,is_rare,is_new,is_recommended,created_at,categories(name,slug)" as const;

export async function listProducts(client: SupabaseClient<Database>, options: {
  q?: string; category?: string; limit: number; cursor?: string;
  flag?: "is_recommended" | "is_rare" | "is_new";
}): Promise<Product[]> {
  let query = client.from("products").select(productFields).eq("is_published", true)
    .order("id", { ascending: true }).limit(options.limit + 1);
  if (options.q) query = query.ilike("name", `%${options.q.replace(/[\\%_]/g, "\\$&")}%`);
  if (options.category) {
    const { data: category, error: categoryError } = await client.from("categories")
      .select("id").eq("slug", options.category).eq("is_published", true).maybeSingle();
    if (categoryError) throw categoryError;
    if (!category) return [];
    query = query.eq("category_id", category.id);
  }
  if (options.cursor) query = query.gt("id", options.cursor);
  if (options.flag) query = query.eq(options.flag, true);
  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as DbProduct[]).map(toProduct);
}

export async function getProduct(client: SupabaseClient<Database>, slug: string): Promise<Product | null> {
  const { data, error } = await client.from("products").select(productFields)
    .eq("slug", slug).eq("is_published", true).maybeSingle();
  if (error) throw error;
  return data ? toProduct(data as unknown as DbProduct) : null;
}

export async function listCategories(client: SupabaseClient<Database>): Promise<Category[]> {
  const { data, error } = await client.from("categories").select("id,name,slug,description,sort_order")
    .eq("is_published", true).order("sort_order").order("name");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id, name: row.name, slug: row.slug, description: row.description, sortOrder: row.sort_order,
  }));
}

export async function listActiveOffers(client: SupabaseClient<Database>, now = new Date()): Promise<Offer[]> {
  const selection = `id,title,description,starts_at,ends_at,offer_products(products(${productFields}))`;
  const { data, error } = await client.from("offers").select(selection)
    .eq("is_published", true).lte("starts_at", now.toISOString()).gt("ends_at", now.toISOString())
    .order("ends_at");
  if (error) throw error;
  type OfferProjection = {
    id: string; title: string; description: string | null; starts_at: string; ends_at: string;
    offer_products: { products: DbProduct | null }[];
  };
  const offers = (data ?? []) as unknown as OfferProjection[];
  return offers.map((row) => ({
    id: row.id, title: row.title, description: row.description, startsAt: row.starts_at,
    endsAt: row.ends_at,
    products: (row.offer_products ?? []).map((link) => link.products).filter(Boolean).map((product) => toProduct(product as unknown as DbProduct)),
  }));
}

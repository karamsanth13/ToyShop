import { NextResponse } from "next/server";
import { listCategories, listProducts } from "@/features/catalogue/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const client = await createSupabaseServerClient();
  if (!client) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Category not found.", details: null } }, { status: 404 });
  try {
    const [categories, products] = await Promise.all([
      listCategories(client), listProducts(client, { category: slug, limit: 48 }),
    ]);
    const category = categories.find((item) => item.slug === slug);
    return category
      ? NextResponse.json({ data: { category, products } })
      : NextResponse.json({ error: { code: "NOT_FOUND", message: "Category not found.", details: null } }, { status: 404 });
  } catch {
    return NextResponse.json({ error: { code: "CATALOGUE_UNAVAILABLE", message: "The catalogue is temporarily unavailable.", details: null } }, { status: 503 });
  }
}

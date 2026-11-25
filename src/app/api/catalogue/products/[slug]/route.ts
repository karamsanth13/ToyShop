import { NextResponse } from "next/server";
import { getProduct } from "@/features/catalogue/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const client = await createSupabaseServerClient();
  if (!client) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Product not found.", details: null } }, { status: 404 });
  try {
    const product = await getProduct(client, slug);
    return product
      ? NextResponse.json({ data: product })
      : NextResponse.json({ error: { code: "NOT_FOUND", message: "Product not found.", details: null } }, { status: 404 });
  } catch {
    return NextResponse.json({ error: { code: "CATALOGUE_UNAVAILABLE", message: "The catalogue is temporarily unavailable.", details: null } }, { status: 503 });
  }
}

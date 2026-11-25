import { NextRequest, NextResponse } from "next/server";
import { productQuerySchema } from "@/features/catalogue/validation";
import { listProducts } from "@/features/catalogue/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const failure = (status: number, code: string, message: string) => NextResponse.json({ error: { code, message, details: null } }, { status });

export async function GET(request: NextRequest) {
  const parsed = productQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return failure(400, "INVALID_QUERY", "Search parameters are invalid.");
  const client = await createSupabaseServerClient();
  if (!client) return NextResponse.json({ data: { items: [], nextCursor: null } });
  try {
    const rows = await listProducts(client, parsed.data);
    const hasMore = rows.length > parsed.data.limit;
    const items = rows.slice(0, parsed.data.limit);
    return NextResponse.json({ data: { items, nextCursor: hasMore ? items.at(-1)?.id ?? null : null } });
  } catch {
    return failure(503, "CATALOGUE_UNAVAILABLE", "The catalogue is temporarily unavailable.");
  }
}

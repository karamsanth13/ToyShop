import { NextResponse } from "next/server";
import { listCategories } from "@/features/catalogue/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const client = await createSupabaseServerClient();
  if (!client) return NextResponse.json({ data: [] });
  try { return NextResponse.json({ data: await listCategories(client) }); }
  catch { return NextResponse.json({ error: { code: "CATALOGUE_UNAVAILABLE", message: "Categories are temporarily unavailable.", details: null } }, { status: 503 }); }
}

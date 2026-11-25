import { NextResponse } from "next/server";
import { listActiveOffers } from "@/features/catalogue/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const client = await createSupabaseServerClient();
  if (!client) return NextResponse.json({ data: [] });
  try { return NextResponse.json({ data: await listActiveOffers(client) }); }
  catch { return NextResponse.json({ error: { code: "CATALOGUE_UNAVAILABLE", message: "Offers are temporarily unavailable.", details: null } }, { status: 503 }); }
}

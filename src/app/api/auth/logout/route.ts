import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return NextResponse.json({ error: { code: "LOGOUT_FAILED", message: "Could not end the session." } }, { status: 500 });
  return NextResponse.json({ data: { signedOut: true } });
}

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userId = process.env.SUPABASE_BOOTSTRAP_USER_ID;

if (!url || !key || !userId) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SUPABASE_BOOTSTRAP_USER_ID first.");
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const { data: existing, error: existingError } = await supabase
  .from("admin_profiles").select("id").eq("role", "Super Admin").limit(1);
if (existingError) throw new Error("Could not check current Super Admin state.");
if (existing?.length) throw new Error("A Super Admin already exists; bootstrap is one-time only.");

const { data: authUser, error: userError } = await supabase.auth.admin.getUserById(userId);
if (userError || !authUser.user?.email) throw new Error("Bootstrap Auth user was not found or has no email.");
const { error: insertError } = await supabase.from("admin_profiles").insert({
  id: authUser.user.id,
  full_name: String(authUser.user.user_metadata?.full_name ?? "Shop owner").slice(0, 120),
  email: authUser.user.email,
  role: "Super Admin",
});
if (insertError) throw new Error("Could not create the Super Admin profile.");
console.log("Initial Super Admin profile created.");

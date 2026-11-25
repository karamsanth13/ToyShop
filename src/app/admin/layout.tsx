import { redirect } from "next/navigation";
import { AuthRequiredError, requireAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  try { await requireAdmin(); }
  catch (cause) {
    if (cause instanceof AuthRequiredError) redirect("/login");
    redirect("/login");
  }
  return <>{children}</>;
}

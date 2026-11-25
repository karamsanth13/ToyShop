import { redirect } from "next/navigation";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { AdminAccounts } from "@/features/auth/admin-accounts";
import { requireSuperAdmin } from "@/lib/auth/guards";

export default async function AdminAccountsPage() {
  try { await requireSuperAdmin(); } catch { redirect("/admin"); }
  return <main style={{ paddingBlock: "2rem" }}><PageContainer><SectionHeading title="Admin access" description="Only Super Admins can invite or remove Admin accounts." /><AdminAccounts /></PageContainer></main>;
}

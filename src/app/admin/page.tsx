import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { LogoutButton } from "@/components/layout/logout-button";

export default async function AdminHomePage() {
  const admin = await requireAdmin();
  return (
    <main style={{ paddingBlock: "2.5rem" }}>
      <PageContainer>
        <SectionHeading title="Shop administration" description={`Signed in as ${admin.role}.`} />
        <Card style={{ padding: "1.5rem" }}>
          <h2>Shop identity</h2>
          <p>Update your public shop details, contact information, map location, logo and social links.</p>
          <Link className="button button-primary" href="/admin/settings">Open shop settings</Link>
          {admin.role === "Super Admin" ? <div style={{ marginTop: "1rem" }}><Link className="button button-secondary" href="/admin/accounts">Manage admin access</Link></div> : null}
          <div style={{ marginTop: "1rem" }}><LogoutButton /></div>
        </Card>
      </PageContainer>
    </main>
  );
}

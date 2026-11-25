import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ShopSettingsForm } from "@/features/shop/settings-form";

export default function AdminSettingsPage() {
  return <main style={{ paddingBlock: "2rem" }}><PageContainer><SectionHeading title="Shop settings" description="Manage the public details visitors see." /><ShopSettingsForm /></PageContainer></main>;
}

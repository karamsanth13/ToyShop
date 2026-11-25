import { notFound } from "next/navigation";
import { PageContainer, SectionHeading } from "@/components/ui";
import { ProductGrid } from "@/features/catalogue/components/product-grid";
import { listCategories, listProducts } from "@/features/catalogue/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const client = await createSupabaseServerClient();
  if (!client) notFound();
  const [categories, products] = await Promise.all([
    listCategories(client), listProducts(client, { category: slug, limit: 48 }),
  ]);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  return <PageContainer className="py-10"><SectionHeading title={category.name} description={category.description ?? "Explore toys in this category."}/><ProductGrid products={products} emptyTitle="Nothing here just yet" emptyMessage="Check back soon for toys in this category."/></PageContainer>;
}

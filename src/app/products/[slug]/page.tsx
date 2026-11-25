import { notFound } from "next/navigation";
import { Badge, PageContainer } from "@/components/ui";
import { getProduct } from "@/features/catalogue/repository";
import { ProductImage } from "@/features/catalogue/components/product-image";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const client = await createSupabaseServerClient();
  const product = client ? await getProduct(client, slug) : null;
  if (!product) notFound();
  return <PageContainer className="py-10"><article className="grid gap-8 md:grid-cols-2">
    <div className="relative aspect-square overflow-hidden rounded-3xl bg-surface">
      <ProductImage src={product.images[0]} alt={product.name} priority sizes="(max-width: 768px) 100vw, 50vw" />
    </div>
    <div className="self-center"><div className="flex flex-wrap gap-2"><Badge tone={product.availability === "in_stock" ? "success" : "danger"}>{product.availability === "in_stock" ? "In stock" : "Out of stock"}</Badge>{product.isNew && <Badge tone="accent">New</Badge>}{product.isRare && <Badge>Rare find</Badge>}</div>
      <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl">{product.name}</h1>{product.category && <p className="mt-2 text-muted">{product.category.name}</p>}
      <p className="mt-6 text-3xl font-extrabold">{product.price}</p><p className="mt-5 whitespace-pre-line leading-7 text-muted">{product.description || "Ask us in store to learn more about this toy."}</p>
      {product.availability === "out_of_stock" && <p className="mt-6 rounded-xl bg-page p-4 text-sm">This toy is currently out of stock. Please visit the shop to ask about availability.</p>}
    </div>
  </article></PageContainer>;
}

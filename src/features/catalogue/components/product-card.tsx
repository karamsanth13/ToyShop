import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import type { Product } from "@/types/catalogue";
import { ProductImage } from "./product-image";

export function ProductCard({ product }: { product: Product }) {
  return <Card className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
    <Link href={`/products/${product.slug}`} className="block focus-visible:outline-offset-[-3px]">
      <div className="relative aspect-[4/3] bg-page">
        <ProductImage src={product.images[0]} alt={product.name} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px" />
        <div className="absolute left-3 top-3"><Badge tone={product.availability === "in_stock" ? "success" : "danger"}>{product.availability === "in_stock" ? "In stock" : "Out of stock"}</Badge></div>
      </div>
      <div className="p-4"><h3 className="line-clamp-2 min-h-12 font-bold">{product.name}</h3><p className="mt-2 text-lg font-extrabold">{product.price}</p>{product.category && <p className="mt-1 text-sm text-muted">{product.category.name}</p>}</div>
    </Link>
  </Card>;
}

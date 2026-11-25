import { EmptyState } from "@/components/ui";
import type { Product } from "@/types/catalogue";
import { ProductCard } from "./product-card";

export function ProductGrid({ products, emptyTitle = "No toys found", emptyMessage = "Try another search or browse a category." }: { products: Product[]; emptyTitle?: string; emptyMessage?: string }) {
  if (!products.length) return <EmptyState title={emptyTitle}>{emptyMessage}</EmptyState>;
  return <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}

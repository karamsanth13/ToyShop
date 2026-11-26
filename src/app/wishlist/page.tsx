"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { useWishlist } from "@/features/engagement/wishlist/use-wishlist";
import { ProductCard } from "@/features/catalogue/components/product-card";
import type { Product } from "@/types/catalogue";

export default function WishlistPage() {
  const { productIds, toggle } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!productIds.length) {
      setProducts([]);
      setLoading(false);
      return () => { active = false; };
    }
    setLoading(true);
    setError("");
    fetch(`/api/wishlist/products?ids=${encodeURIComponent(productIds.join(","))}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error("Saved toys could not be loaded.");
        if (active) setProducts(result.data as Product[]);
      })
      .catch(() => { if (active) setError("Saved toys could not be loaded. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [productIds]);

  return (
    <main style={{ paddingBlock: "2.5rem" }}>
      <PageContainer>
        <SectionHeading title="Your wishlist" description="Your saved picks stay on this device." />
        {loading ? <p role="status">Loading saved toys…</p> : null}
        {error ? <p role="alert" className="text-danger">{error}</p> : null}
        {!loading && !error && !productIds.length ? <EmptyState title="Your wishlist is ready"><p>Browse the toy collection and save favorites here.</p></EmptyState> : null}
        {!loading && !error && productIds.length > 0 && products.length === 0 ? <EmptyState title="No saved toys are available"><p>These products may have been removed or are no longer published.</p></EmptyState> : null}
        {!loading && products.length > 0 ? <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">{products.map((product) => <div key={product.id} className="grid content-start gap-2"><ProductCard product={product} /><Button type="button" variant="secondary" onClick={() => toggle(product.id)}>Remove from wishlist</Button></div>)}</div> : null}
      </PageContainer>
    </main>
  );
}

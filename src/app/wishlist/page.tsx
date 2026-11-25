"use client";

import { Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { useWishlist } from "@/features/engagement/wishlist/use-wishlist";

export default function WishlistPage() {
  const { productIds } = useWishlist();
  return (
    <main style={{ paddingBlock: "2.5rem" }}>
      <PageContainer>
        <SectionHeading title="Your wishlist" description="Your saved picks stay on this device." />
        {productIds.length === 0
          ? <EmptyState title="Your wishlist is ready"><p>Browse the toy collection and save favorites here.</p></EmptyState>
          : <EmptyState title="Your saved picks are waiting"><Heart aria-hidden="true" size={24} /><p>Saved items are stored on this device. Product details will appear here when the catalogue connection is available.</p></EmptyState>}
      </PageContainer>
    </main>
  );
}

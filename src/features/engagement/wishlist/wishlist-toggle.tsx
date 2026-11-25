"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "./use-wishlist";

export function WishlistToggle({ productId }: { productId: string }) {
  const wishlist = useWishlist();
  const saved = wishlist.has(productId);
  return (
    <Button
      type="button"
      variant="ghost"
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      onClick={() => wishlist.toggle(productId)}
    >
      <Heart aria-hidden="true" size={20} fill={saved ? "currentColor" : "none"} />
    </Button>
  );
}

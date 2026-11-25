"use client";

import { useSyncExternalStore } from "react";
import { getWishlistServerSnapshot, getWishlistSnapshot, subscribeWishlist, toggleWishlistId } from "./store";

export function useWishlist() {
  const productIds = useSyncExternalStore(subscribeWishlist, getWishlistSnapshot, getWishlistServerSnapshot);
  return {
    productIds,
    has: (id: string) => productIds.includes(id),
    toggle: (id: string) => toggleWishlistId(id),
  };
}

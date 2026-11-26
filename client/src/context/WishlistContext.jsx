import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const WishlistContext = createContext(null);
const STORAGE_KEY = "toyshop-wishlist-ids";
const WISHLIST_EVENT = "toyshop-wishlist-change";

function readIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? [...new Set(parsed.filter((id) => typeof id === "string" && id.length <= 128))] : [];
  } catch { return []; }
}

export function WishlistProvider({ children }) {
  const [productIds, setProductIds] = useState(readIds);

  useEffect(() => {
    const sync = (event) => {
      if (event.type === "storage" && event.key !== STORAGE_KEY) return;
      setProductIds(event.type === WISHLIST_EVENT && Array.isArray(event.detail) ? event.detail : readIds());
    };
    window.addEventListener("storage", sync);
    window.addEventListener(WISHLIST_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(WISHLIST_EVENT, sync);
    };
  }, []);

  const save = useCallback((next) => {
    setProductIds(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Keep session-only state. */ }
    window.dispatchEvent(new CustomEvent(WISHLIST_EVENT, { detail: next }));
  }, []);
  const toggle = useCallback((id) => save(productIds.includes(id) ? productIds.filter((item) => item !== id) : [...productIds, id]), [productIds, save]);
  const remove = useCallback((id) => save(productIds.filter((item) => item !== id)), [productIds, save]);
  const value = useMemo(() => ({ productIds, has: (id) => productIds.includes(id), toggle, remove }), [productIds, toggle, remove]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const value = useContext(WishlistContext);
  if (!value) throw new Error("useWishlist must be used inside WishlistProvider.");
  return value;
}

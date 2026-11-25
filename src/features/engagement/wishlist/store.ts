const STORAGE_KEY = "toyshop-wishlist-ids";
const EVENT_NAME = "toyshop-wishlist-change";
const SERVER_SNAPSHOT: string[] = [];
let snapshot: string[] = SERVER_SNAPSHOT;
let initialized = false;

function readSnapshot(): string[] {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  if (!initialized) {
    initialized = true;
    try {
      const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
      snapshot = Array.isArray(parsed) ? [...new Set(parsed.filter((id): id is string => typeof id === "string" && id.length <= 128))] : [];
    } catch { snapshot = []; }
  }
  return snapshot;
}

function notify() {
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function subscribeWishlist(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    initialized = false;
    callback();
  };
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", onStorage);
  return () => { window.removeEventListener(EVENT_NAME, callback); window.removeEventListener("storage", onStorage); };
}

export function getWishlistSnapshot() { return readSnapshot(); }
export function getWishlistServerSnapshot() { return SERVER_SNAPSHOT; }

export function toggleWishlistId(id: string): string[] {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  const current = readSnapshot();
  snapshot = current.includes(id) ? current.filter((saved) => saved !== id) : [...current, id];
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)); } catch { /* Keep session-only state if storage is unavailable. */ }
  notify();
  return snapshot;
}

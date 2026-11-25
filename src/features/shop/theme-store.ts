import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";
const EVENT_NAME = "toyshop-theme-change";

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback);
  return () => window.removeEventListener(EVENT_NAME, callback);
}

function getServerSnapshot(): Theme { return "light"; }

export function useCurrentTheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setCurrentTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem("toyshop-theme", theme); } catch { /* The current page still receives the theme. */ }
  window.dispatchEvent(new Event(EVENT_NAME));
}

"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setCurrentTheme, useCurrentTheme } from "@/features/shop/theme-store";

export function ThemeToggle() {
  const theme = useCurrentTheme();

  function toggle() {
    setCurrentTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <Button variant="ghost" type="button" onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
      {theme === "dark" ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
    </Button>
  );
}

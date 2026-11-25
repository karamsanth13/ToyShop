"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function signOut() {
    setBusy(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) { router.replace("/login"); router.refresh(); }
    } finally { setBusy(false); }
  }
  return <Button type="button" variant="ghost" onClick={signOut} disabled={busy}>{busy ? "Signing out…" : "Sign out"}</Button>;
}
